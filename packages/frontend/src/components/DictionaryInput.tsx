export default function DictionaryInput(props: {
  setLetter: (letter: string) => void;
}) {
  return (
    <input
      class="border-gray-800 border h-16 w-16 text-3xl text-center"
      onInput={(e) => props.setLetter(e.currentTarget.value)}
      type="text"
      maxlength={1}
    />
  );
}
