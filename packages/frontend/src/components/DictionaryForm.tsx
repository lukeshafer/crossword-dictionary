import { For, JSX, Suspense, createEffect, createResource, on } from "solid-js";
import { createStore, produce } from "solid-js/store";

type Letter = {
  letter: string | null;
};

const DEFAULT_LENGTH = 5;

const DEFAULT_LETTERS: Array<Letter> = [];
for (let i = 0; i < DEFAULT_LENGTH; i++) {
  DEFAULT_LETTERS.push({ letter: null });
}

type State = {
  letters: Array<Letter>;
};

export default function DictionaryForm() {
  const [state, setState] = createStore<State>({ letters: DEFAULT_LETTERS });

  const grow = () =>
    setState(
      "letters",
      produce((list) => list.push({ letter: null })),
    );
  const shrink = () =>
    setState(
      "letters",
      produce((list) => list.pop()),
    );

  const [searchResults] = createResource<Array<string>, Array<string | null>>(
    () => state.letters.map(({ letter }) => letter),
    async (letters, info) => {
      console.log("Searching letters in resource");
      let noLetters = true;
      const url = new URL(import.meta.env.VITE_API_URL);
      url.pathname = "/search";
      url.searchParams.set("length", String(letters.length));
      letters.forEach((letter, index) => {
        if (letter) {
          url.searchParams.set(`char_${index + 1}`, letter);
          noLetters = false;
        }
      });

      if (noLetters) return [];

      const res = await fetch(url);

      const json = await res.json().catch(() => ({}));
      if (Array.isArray(json)) {
        return json.sort();
      } else {
        return info.value ?? [];
      }
    },
  );

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
          onSubmit={async (e) => e.preventDefault()}
        >
          <ul class="flex gap-2">
            <For each={state.letters}>
              {(_, index) => (
                <li>
                  <DictionaryInput
                    value={state.letters[index()].letter ?? ""}
                    setValue={(value) => {
                      const i = index();
                      setState("letters", i, { letter: value || null });
                    }}
                  />
                </li>
              )}
            </For>
          </ul>
          <button
            class="border-gray-500 border-2 px-2 py-1 bg-sky-100 focus:border-brand-outline"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
      <ul class="grid gap-2 mx-auto max-w-sm ">
        <Suspense fallback="Loading...">
          <For each={searchResults()}>{(string) => <li>{string}</li>}</For>
        </Suspense>
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
      class="bg-sky-100 border-gray-500 focus:border-brand-outline border-2 w-8 h-8 grid items-center pb-1 font-bold text-center"
    />
  );
}

const GROW_CHARS = ["=", "+"];
const SHRINK_CHARS = ["-", "_"];

function DictionaryInput(props: {
  value: string;
  setValue: (letter: string) => void;
}) {
  return (
    <input
      value={props.value}
      class="border-gray-500 border-2 h-16 w-16 text-3xl text-center focus:border-brand-outline"
      pattern="[A-Z]"
      maxLength="1"
      onKeyDown={(e) => {
        switch (e.key) {
          case "Backspace":
            if (!props.value) focusPrevSiblingInput(e.currentTarget);
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
          e.currentTarget.value = props.value;
          return;
        }

        if (letter.length > 0) {
          focusNextSiblingInput(e.currentTarget);
        }

        props.setValue(letter);
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
