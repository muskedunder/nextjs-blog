---
title: 'Template for data annotation with streamlit'
date: '2021-10-07'
---

[Streamlit](https://streamlit.io) is a Python framework for building simple and beautiful web apps for data exploration. I recently wanted to build a tool for doing data annotation and thought I could perhaps use streamlit. The app I had in mind was the simplest possible - it should display an example from a dataset and ask the user to provide a set of labels to the example - once the labels were submitted the next example from the dataset should be displayed, and so on.

Since streamlit - at least when it first came out a few years ago - was mainly designed to display data and not capture data from the user, it can be a bit difficult to get it right, at least it was for me, which is why I wanted to share a simple template that I think can be easily adapted to a lot of different data annotation tasks.

Let's assume we have a data set of product reviews and the task of the annotator is to provide a sentiment to each review. We will work on a dataset with the following format:
```python
dataset = (
    {
        'id': "50e157816b",
        'date': "2021-08-23",
        'product_id': 23356,
        'review': "Absolutely loved it.",
    },
    {
        'id': "113649fa84",
        'date': "2020-02-12",
        'product_id': 23356,
        'review': "Didn't work as I expected but happy anyway.",
    },
    {
        'id': "fc19cd0ba8",
        'date': "2020-01-26",
        'product_id': 34567,
        'review': "Seem to last just as long as other batteries I have paid more for.",
    },
    {
        'id': "b7edf6adab",
        'date': "2019-11-04",
        'product_id': 85403,
        'review': "Not the quality they describe. Absolute trash. Thumbs down.",
    },
)
```
We also have a list of available labels that the annotator can attach to a review.
```python
initial_labels = [
    "positive",
    "negative",
]
```
Notice that the data set is a python tuple while the list of available labels is a regular list? That's because we assume the data set to be static while we will later allow the annotator to add more possible labels to the list of labels.

Next, we initialize the streamlit state. The state allows us to keep data between runs of the streamlit script, for example `st.session_state.idx` will be used to access the correct example from the dataset. Read more about streamlit session state [here](https://docs.streamlit.io/library/advanced-features/session-state).
```python
if 'idx' not in st.session_state:
    st.session_state.idx = 0

if 'annotations' not in st.session_state:
    st.session_state.annotations = defaultdict(lambda: "unknown")

if 'available_labels' not in st.session_state:
    st.session_state.available_labels = initial_labels
```
`annotations` will be used to store the annotations that are submited for each instance in the data set and finally `available_labels` will be used to to store the labels that the annotator can choose from. In a real application, you would probably not need to keep `annotations` and `available_labels` in the streamlit state, as they would probably be external resources that you could make calls to.

Next, here is a function for displaying a sample from the dataset given its index.
```python
def show_sample(streamlit_placeholder, sample_idx):
    if sample_idx < len(dataset):
        with streamlit_placeholder.container():
            st.markdown(f"Date: `{dataset[sample_idx]['date']}`")
            st.markdown(f"Review: `{dataset[sample_idx]['review']}`")

```
This function takes an index and displays the data using built in streamlit functions, in our case the data is just text, but it could just as well have been images, audio or video.
As we will see later, the input argument `streamlit_placeholder` is an instance of `st.empty()`, that is, we have asked streamlit to allocate some space where we will display data using `show_sample`. Also note that `show_sample` could just as well have read the data at `sample_idx` from the file sysytem or through calls to a database.

We also have a function for storing the labels of a sample with a certain index
```python
def set_label(label, sample_idx):
    if sample_idx < len(dataset):
        st.session_state.annotations[dataset[sample_idx]['id']] = label
```
Here we use the `id` attribute as the key so that we can easily pair the stored labels with the correct sample from the data set.

We now have all the necessary components to iterate through the dataset and show a sample at the time. We show the data inside a streamlit [form](https://docs.streamlit.io/library/api-reference/control-flow/st.form), this allows us to potentially have multiple widgets inside the form that the annotator can interact with. The annotator can choose to submit labels to the shown example or to skip the example.
```python
with st.form('labeling', clear_on_submit=True):

    data_container = st.empty()

    show_sample(data_container, st.session_state.idx)
    selected_label = st.radio("Select review sentiment label:", sorted(st.session_state.available_labels))

    submit_col, skip_col = st.columns(2)
    submit = submit_col.form_submit_button("submit")
    skip = skip_col.form_submit_button("skip")

    if submit:
        set_label(selected_label, st.session_state.idx)

    if submit or skip:
        st.session_state.idx += 1
        show_sample(data_container, st.session_state.idx)
        if st.session_state.idx >= len(dataset):
            data_container.text("No more data to annotate")
```
One thing is missing from the app, if the annotator is not happy with the contents of `available_labels`, it should be possible to add additional ones. We place this component above the labeling component so that any new added labels are instantly available for labeling.
```python
with st.form(key='add-label', clear_on_submit=True):
    new_label = st.text_input("Add new label to list", "")
    submitted = st.form_submit_button("Add label")
    if submitted and new_label != "" and new_label not in st.session_state.available_labels:
        st.session_state.available_labels.append(new_label)
```
Here is a small demo of the final application
![image info](/gifs/streamlit-demo.gif)

The code is available at [Github](https://github.com/muskedunder/streamlit-annotator) and the you can play with the example app [here](https://share.streamlit.io/muskedunder/streamlit-annotator/main/annotator.py).
