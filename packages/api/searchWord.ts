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
    console.log("ROW", { letter, i });
    if (letter) {
      if (!currentSearch) {
        currentSearch = {
          position: i,
          text: letter,
        };
      } else {
        currentSearch.text = currentSearch.text + letter;
      }
      continue;
    } else if (currentSearch) {
      searches.push(currentSearch);
      currentSearch = null;
      continue;
    }
  }

  const results = await Promise.all(
    searches.map(({ text, position }) => {
      return DB.Words.searchPosition({
        length,
        search: text,
        position,
      });
    }),
  );

  const body = JSON.stringify(results);

  console.log("SEARCH RESULTS", body);
  const r = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body,
  };
  console.log({ r });
  return r;
};
