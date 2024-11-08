import React from "react";

const GithubProfileCanvas = () => {
    return (
        <React.Fragment>
            <input
                type="text"
                placeholder="Enter Github Username"
                className="w-full focus:outline-none text-white p-1.5 px-8 py-5 rounded-lg bg-neutral-700"
            />
            <button className="mt-5 p-3 text-white transition hover:bg-neutral-600 duration-200 shadow-sm shadow-black bg-neutral-700 px-8 rounded-xl">Generate Profile</button>
        </React.Fragment>
    )
}

export default GithubProfileCanvas;