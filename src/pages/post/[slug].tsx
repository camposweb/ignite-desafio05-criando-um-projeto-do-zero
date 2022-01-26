import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic'
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';



interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

 export default function Post({ post }: PostProps) {

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

   return (
     <>
      
      <Header />
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <h1>{post.data.title}</h1>
          <ul>
            <li><FiCalendar /> {format(new Date(post.first_publication_date),
                                  "dd MMM yyyy",
                                  {
                                    locale: ptBR,
                                  })
                                  }
            </li>
            <li><FiUser /> {post.data.author}</li>
            <li><FiClock /> 4 min</li>
          </ul>
          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <strong>{content.heading}</strong>
                <div 
                  className={styles.post}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body),}}
                  />
              </article>
            )
          })}
        </div>
      </main>
     </>
   )
 }

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document-type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })
 
  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post, 
    }
  }
};
