import GithubProfileCanvas from "./components/GithubProfileCanvas"

function App() {
  return (
    <div className="text-pink-300 h-screen flex flex-col items-center justify-center bg-neutral-900 font-bold text-center">
      <h1 className="text-3xl -mt-12">Github Profile Generator</h1>
      <div className="mt-20">
        <GithubProfileCanvas />
      </div>
    </div>
  )
}

export default App
