import Head from "next/head"
import Date from "../../components/date"
import Layout from "../../components/layout"
import CodeBlock from "../../components/codeblock"
import { getAllPostIds, getPostData } from "../../lib/posts"
import utilStyles from '../../styles/utils.module.css'
import ReactMarkdown from "react-markdown"

export default function Post( {postData} ) {
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                    <Date dateString={postData.date} />
                </div>
                <ReactMarkdown components={CodeBlock}>{postData.markdown}</ReactMarkdown>
            </article>
        </Layout>
    )
}

export async function getStaticPaths() {
    const paths = getAllPostIds()
    return {
        paths,
        fallback: false,
    }
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id)
    return {
        props: {
            postData,
        }
    }
}
