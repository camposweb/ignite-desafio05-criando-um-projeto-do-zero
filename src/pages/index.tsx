import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const formatPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date),
                                "dd MMM yyyy",
                                {
                                  locale: ptBR,
                                }),
    }
  })

  const [posts, setPosts] = useState<Post[]>(formatPost)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setcurrentPage] = useState(1)

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }
    const postsResults = await fetch(`${nextPage}`).then(response => response.json());

    setNextPage(postsResults.next_page)
    setcurrentPage(postsResults.page)

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date)  ,
                                "dd MMM yyyy",
                                {
                                  locale: ptBR,
                                }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
      }
      }
    })

    setPosts([...posts, ...newPosts])
  }
  
  return(
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
          {posts.map(post => (
            <div className={styles.posts} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
              </a>
            </Link> 
            <p>{post.data.subtitle}</p>
            <div className={styles.content}>
              <time><FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM yyyy",
                    {
                      locale: ptBR,
                    }
                    )}
              </time>
              <p><FiUser /> {post.data.author}</p>
            </div>
          </div>
          ))}
          {nextPage && 
            <button type="button" onClick={handleNextPage} className={styles.button}>Carregar mais posts</button>
          }
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 
            'post.subtitle',
            'post.author',
            ],
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  //console.log(JSON.stringify(postsPagination, null, 2));

  return {
    props: {
      postsPagination
    }
  }

};
