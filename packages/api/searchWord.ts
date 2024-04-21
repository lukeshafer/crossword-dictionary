import { APIGatewayProxyHandlerV2 } from "aws-lambda";

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

  const body = JSON.stringify(searches, null, 3);

  console.log("SEARCHES", body);
  const r = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: '{ "test": "TEST" }',
  };
  console.log({ r });
  return r;
};
