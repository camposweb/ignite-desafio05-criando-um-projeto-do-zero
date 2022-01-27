import styles from './comments.module.scss';

export function Comments() {

  return (
    <section className={styles.section}
      //style={{ width: '100%' }}
      ref={
        element => {
          if (!element) {
            return
          }

          const scriptElement = document.createElement('script')
          scriptElement.setAttribute('src', 'https://utteranc.es/client.js')
          scriptElement.setAttribute('repo', 'camposweb/ignite-desafio05-criando-um-projeto-do-zero')
          scriptElement.setAttribute('issue-term', 'pathname')
          scriptElement.setAttribute('theme', 'github-dark')
          scriptElement.setAttribute('crossorigin', 'anonymous')
          scriptElement.setAttribute('async', 'true')
          element.replaceChildren(scriptElement)
        }
      }
    />
  )
}