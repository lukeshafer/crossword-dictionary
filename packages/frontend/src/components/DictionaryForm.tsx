import { For, createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import DictionaryInput from "./DictionaryInput";

type Letter = {
  letter: string | null;
};

const BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_LENGTH = 3;

const DEFAULT_LETTERS: Array<Letter> = [];
for (let i = 0; i < DEFAULT_LENGTH; i++) {
  DEFAULT_LETTERS.push({ letter: null });
}

const LettersContext = createContext<Array<Letter>>([]);

export default function DictionaryForm() {
  const [letters, setLetters] = createStore<Array<Letter>>(DEFAULT_LETTERS);

  return (
    <LettersContext.Provider value={letters}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const url = new URL(BASE_URL);
          url.pathname = "/search";
          url.searchParams.set("length", String(letters.length));
          letters.forEach(({ letter }, index) => {
            if (letter) url.searchParams.set(`char_${index}`, letter);
          });

          const res = await fetch(url, {
            mode: "no-cors",
          });

          console.log(await res.text());
        }}
      >
        <button
          name="add"
          onclick={(e) => {
            e.preventDefault();
            setLetters(produce((list) => list.push({ letter: null })));
          }}
        >
          Add
        </button>
        <button
          name="remove"
          onclick={(e) => {
            e.preventDefault();
            setLetters(produce((list) => list.pop()));
          }}
        >
          Remove
        </button>
        <ul class="flex gap-2">
          <For each={letters}>
            {(_, index) => (
              <li>
                <DictionaryInput
                  setLetter={(value) =>
                    setLetters(index(), { letter: value || null })
                  }
                />
              </li>
            )}
          </For>
        </ul>
        <button type="submit">Submit</button>
      </form>
    </LettersContext.Provider>
  );
}
