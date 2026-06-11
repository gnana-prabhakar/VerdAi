export default function ChatWindow({
  question,
  setQuestion,
  askBot,
  answer
}) {

  return (

    <div className="bg-white rounded-3xl shadow-xl p-6">

      <div className="space-y-4">

        {question && (
          <div className="flex justify-end">

            <div className="bg-green-600 text-white p-4 rounded-2xl max-w-lg">

              {question}

            </div>

          </div>
        )}

        {answer && (
          <div className="flex justify-start">

            <div className="bg-gray-100 p-4 rounded-2xl max-w-lg">

              {answer}

            </div>

          </div>
        )}

      </div>

      <div className="mt-8">

        <textarea
          rows="4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border rounded-xl p-4"
          placeholder="Ask about crops, diseases, treatment..."
        />

        <button
          onClick={askBot}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
        >
          Ask AI
        </button>

      </div>

    </div>

  );

}