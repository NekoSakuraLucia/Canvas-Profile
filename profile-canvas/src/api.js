export const GITUHB_API_BASE_URL = "https://api.github.com";

export const fetchGithubProfile = async (username) => {
    const response = await fetch(`${GITUHB_API_BASE_URL}/users/${username}`)
    if (!response) throw new Error("User not found");
    const data = await response.json();
    return data;
}