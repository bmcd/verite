import { compact } from "lodash"
import Head from "next/head"
import Link from "next/link"
import { FC } from "react"

type Props = {
  title?: string
}

const Layout: FC<Props> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{compact(["Verity.id", title]).join(" | ")}</title>
      </Head>
      <div className="min-h-screen px-4 text-base antialiased text-black bg-gray-100 font-inter font-feature-default">
        <div className="max-w-3xl mx-auto">
          <header className="flex flex-col items-center justify-between p-4 pt-8 space-y-4 sm:p-8 sm:flex-row sm:space-y-0">
            <Link href="/">
              <a className="text-2xl font-extrabold tracking-tight text-center text-gray-700 hover:text-gray-500">
                Verity.id
              </a>
            </Link>

            <div className="flex items-center justify-between space-x-4">
              <Link href="/demos">
                <a className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-700 hover:text-white">
                  Demos
                </a>
              </Link>
              <Link href="/documentation">
                <a className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-700 hover:text-white">
                  Documentation
                </a>
              </Link>
            </div>
          </header>
          <main className="max-w-4xl p-4 mx-auto bg-white sm:p-8 rounded-xl">
            {title && (
              <h1 className="pb-4 text-2xl font-bold text-gray-900 sm:pb-10 sm:text-3xl">
                {title}
              </h1>
            )}
            {children}
          </main>
          <footer className="py-8 text-sm text-center text-gray-500 text-extralight">
            &copy;{new Date().getFullYear()} Centre | Software open sourced
            under the MIT license
          </footer>
        </div>
      </div>
    </>
  )
}

export default Layout
