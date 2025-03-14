import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'

import Readme from '../../../README.md'

export default () => {
  const {siteConfig} = useDocusaurusContext()

  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
    >
      <div className="container">
        <div className="row">
          <main className="col">
            <Readme />
          </main>
        </div>
      </div>
    </Layout>
  )
}
