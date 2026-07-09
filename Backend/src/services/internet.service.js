import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });


export const internetSearch = async ({ query }) => { 

    try {
        console.log("🔥 TOOL CALLED");
        console.log("Query:", query);
        const response = await tvly.search(query, {
            maxResults: 5,
            searchDepth: "advanced"
        });
        console.log(
            response.results.map(r => ({
                title: r.title,
                url: r.url,
                published: r.published_date,
            }))
        );

        return response.results
            .map(
                (r) => `
Title: ${r.title}
Published: ${r.published_date}
Source: ${r.url}

${r.content}
`
            )
            .join("\n\n-----------------\n\n");
    } catch (error) {
        console.error("Error occurred while searching the internet:", error);
        throw error;
    }
};