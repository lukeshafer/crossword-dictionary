const LENGTH = 5;

class DictionaryForm extends HTMLElement {
  url = import.meta.env.VITE_API_URL;
  form = this.querySelector("form")!;
  connectedCallback() {
    console.log(this.url);
    this.form.onsubmit = this.submitForm.bind(this);
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

customElements.define("dictionary-form", DictionaryForm);
