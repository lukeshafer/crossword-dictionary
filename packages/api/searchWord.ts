import { DB } from "@core/db";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const searchParams = new URLSearchParams(event.rawQueryString);
  console.log({
    query: event.rawQueryString,
    searchParams: searchParams.toString(),
  });
  const length = Number(searchParams.get("length") ?? 0);

  type Search = {
    position: number;
    text: string;
  };
  const searches: Array<Search> = [];
  let currentSearch: Search | null = null;

  for (let i = 1; i <= length; i++) {
    const letter = searchParams.get(`char_${i}`);
    // console.log("ROW", { letter, i });
    if (letter) {
      // console.log("Letter detected:", letter);
      if (!currentSearch) {
        // console.log("Setting currentSearch with", letter);
        currentSearch = {
          position: i,
          text: letter,
        };
      } else {
        // console.log("Adding", letter, "to currentSearch");
        currentSearch.text = currentSearch.text + letter;
      }
      continue;
    } else if (currentSearch) {
      // console.log("Pushing current search", { currentSearch });
      searches.push(currentSearch);
      currentSearch = null;
      continue;
    }
  }
  if (currentSearch) {
    searches.push(currentSearch);
  }

  const results = await Promise.all(
    searches.map(({ text, position }) => {
      return DB.Words.searchPosition({
        length,
        search: text,
        position,
      }).then((list) => new Set(list));
    }),
  );

  const intersection = results.reduce((a, b) => {
    const results = new Set<string>();
    for (const aWord of a) {
      if (b.has(aWord)) results.add(aWord);
    }
    return results;
  });

  const body = JSON.stringify(Array.from(intersection));

  console.log("SEARCH RESULTS", { intersection });
  const r = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body,
  };
  return r;
};
