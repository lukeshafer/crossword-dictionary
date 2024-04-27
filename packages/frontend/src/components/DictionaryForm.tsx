import { For, JSX, createEffect, createSignal, on } from "solid-js";
import { createStore, produce } from "solid-js/store";

type Letter = {
  letter: string | null;
};

const DEFAULT_LENGTH = 5;

const DEFAULT_LETTERS: Array<Letter> = [];
for (let i = 0; i < DEFAULT_LENGTH; i++) {
  DEFAULT_LETTERS.push({ letter: null });
}

export default function DictionaryForm() {
  const [letters, setLetters] = createStore<Array<Letter>>(DEFAULT_LETTERS);
  const [results, setResults] = createStore<Array<string>>([]);

  const grow = () => setLetters(produce((list) => list.push({ letter: null })));
  const shrink = () => setLetters(produce((list) => list.pop()));

  return (
    <main>
      <div class="flex gap-2 justify-center p-8">
        <div class="grid justify-items-start gap-1">
          <SizeButton
            name="add"
            onclick={(e) => {
              e.preventDefault();
              grow();
            }}
          >
            +
          </SizeButton>
          <SizeButton
            name="remove"
            onclick={(e) => {
              e.preventDefault();
              shrink();
            }}
          >
            -
          </SizeButton>
        </div>
        <form
          class="flex items-center gap-2"
          onKeyDown={(e) => {
            if (GROW_CHARS.includes(e.key)) {
              return grow();
            }
            if (SHRINK_CHARS.includes(e.key)) {
              return shrink();
            }
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            const url = new URL(import.meta.env.VITE_API_URL);
            url.pathname = "/search";
            url.searchParams.set("length", String(letters.length));
            letters.forEach(({ letter }, index) => {
              if (letter) url.searchParams.set(`char_${index + 1}`, letter);
            });

            const res = await fetch(url);
            // console.log({ res });

            const json = await res.json().catch(() => ({}));
            if (Array.isArray(json)) {
              setResults(json.sort());
            }
          }}
        >
          <ul class="flex gap-2">
            <For each={letters}>
              {(_, index) => (
                <li>
                  <DictionaryInput
                    setLetter={(value) =>
                      setLetters(index(), { letter: value || null })
                    }
                    grow={grow}
                    shrink={shrink}
                  />
                </li>
              )}
            </For>
          </ul>
          <button
            class="border-gray-500 border-2 rounded px-2 py-1 bg-sky-100"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
      <ul class="grid gap-2 mx-auto max-w-sm ">
        <For each={results}>{(string) => <li>{string}</li>}</For>
      </ul>
    </main>
  );
}

function SizeButton(
  props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class">,
) {
  return (
    <button
      {...props}
      class="bg-gray-50 border-gray-500 border-2 w-8 h-8 grid items-center pb-1 font-bold text-center"
    />
  );
}

const GROW_CHARS = ["=", "+"];
const SHRINK_CHARS = ["-", "_"];

function DictionaryInput(props: {
  setLetter: (letter: string) => void;
  grow: () => void;
  shrink: () => void;
}) {
  const [value, setValue] = createSignal("");
  createEffect(on(value, (v) => props.setLetter(v)));

  return (
    <input
      value={value()}
      class="border-gray-500 border-2 h-16 w-16 text-3xl text-center"
      pattern="[A-Z]"
      maxLength="1"
      onKeyDown={(e) => {
        switch (e.key) {
          case "Backspace":
            if (!value()) focusPrevSiblingInput(e.currentTarget);
            return;
          case "ArrowRight":
            return focusNextSiblingInput(e.currentTarget);
          case "ArrowLeft":
            return focusPrevSiblingInput(e.currentTarget);
        }
      }}
      onInput={(e) => {
        const letter = e.currentTarget.value.toUpperCase();
        e.currentTarget.value = letter;

        if (e.currentTarget.validity.patternMismatch === true) {
          e.currentTarget.value = value();
          return;
        }

        if (letter.length > 0) {
          focusNextSiblingInput(e.currentTarget);
        }

        setValue(letter);
      }}
      type="text"
      maxlength={1}
    />
  );
}

function focusNextSiblingInput(focusedInput: HTMLInputElement) {
  const parent = focusedInput.parentElement;
  const sibling = parent?.nextElementSibling;
  const inputToFocus = sibling?.querySelector("input");
  inputToFocus?.focus();
}

function focusPrevSiblingInput(focusedInput: HTMLInputElement) {
  const parent = focusedInput.parentElement;
  const sibling = parent?.previousElementSibling;
  const inputToFocus = sibling?.querySelector("input");
  inputToFocus?.focus();
}
