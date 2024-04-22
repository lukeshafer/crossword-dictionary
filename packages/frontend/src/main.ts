const LENGTH = 5;

class DictionaryForm extends HTMLElement {
  url = import.meta.env.VITE_API_URL;
  form = this.querySelector("form")!;
  list = this.querySelector("ul")!;
  length = 3;
  connectedCallback() {
    console.log(this.url);
    this.form.onsubmit = this.submitForm.bind(this);

    for (let i = 1; i < this.length; i++) {
      this.addChar();
    }

    this.querySelector("button[name=add]").onclick = () => {
      if (this.length >= 7) {
        return;
      }
      this.addChar();
      this.length += 1;
    };
    this.querySelector("button[name=remove]").onclick = () => {
      if (this.length <= 3) {
        return;
      }

      this.length -= 1;
    };
  }

  addChar() {
    const li = document.createElement("li");
    const input = document.createElement("dictionary-input");
    input.setAttribute("index", String(this.length));
    li.appendChild(input);
    this.list.appendChild(li);
  }

  removeChar() {
    this.list.querySelector("li:last-child")?.remove();
  }

  async submitForm(e: SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(this.form);

    const url = new URL(this.url);
    url.pathname = "/search";
    url.searchParams.set("length", String(LENGTH));

    for (let i = 1; i <= LENGTH; i++) {
      const value = formData.get(`char${i}`);
      if (!value || value instanceof File) {
        continue;
      }

      url.searchParams.set(`char_${i}`, value);
    }

    console.log("URL:", url.toString());

    const res = await fetch(url, {
      mode: "no-cors",
    });

    console.log(await res.text());
  }
}

const dictionaryInputTemplate = document.getElementById(
  "dictionary-input-template",
) as HTMLTemplateElement;

class DictionaryInput extends HTMLElement {
  input: HTMLInputElement;
  constructor() {
    super();
    const node = dictionaryInputTemplate.content.cloneNode(true);
    this.replaceChildren(node);
    this.input = this.querySelector("input")!;
  }

  static observedAttributes = ["index"];

  attributeChangedCallback(field: string, _: string, newValue: string) {
    if (field === "index") {
      this.input.name = `char${newValue}`;
    }
  }
}

customElements.define("dictionary-form", DictionaryForm);
customElements.define("dictionary-input", DictionaryInput);
