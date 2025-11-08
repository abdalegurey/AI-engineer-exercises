'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full py-24 h-screen relative bg-gray-100">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 mb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[80%] break-words shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none border'
              }`}
            >
              {msg.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );

                  case 'tool-fetchDadJokeAPI': {
                    const joke = part.result;
                    return (
                      <div
                        key={i}
                        className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg"
                      >
                        <p className="text-sm italic">{joke}</p>
                      </div>
                    );
                  }

                  // Movie tools
                  case 'tool-queryOMDb': {
                    const movie = part.result;
                    if (!movie || movie.error)
                      return (
                        <div key={i} className="text-red-600">
                          {movie?.error || 'Movie not found'}
                        </div>
                      );

                    return (
                      <div
                        key={i}
                        className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
                      >
                        {movie.poster && (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-32 h-auto rounded shadow-sm"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {movie.title} ({movie.year})
                          </h3>
                          <p className="text-sm">
                            <strong>Genre:</strong> {movie.genre}
                          </p>
                          <p className="text-sm">
                            <strong>Director:</strong> {movie.director}
                          </p>
                          <p className="text-sm">
                            <strong>Actors:</strong> {movie.actors}
                          </p>
                          <p className="text-sm">
                            <strong>Runtime:</strong> {movie.runtime}
                          </p>
                          <p className="mt-2 text-sm italic">{movie.plot}</p>
                          {movie.ratings?.length > 0 && (
                            <div className="mt-2 text-sm">
                              <strong>Ratings:</strong>
                              {movie.ratings.map((r: any, idx: number) => (
                                <div key={idx}>
                                  {r.Source}: {r.Value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  case 'tool-searchMovies': {
                    const results = part.result;
                    if (!results || results.error)
                      return (
                        <div key={i} className="text-red-600">
                          {results?.error || 'No results found'}
                        </div>
                      );

                    return (
                      <div key={i} className="bg-gray-50 border rounded-lg p-3">
                        <h4 className="font-semibold mb-2">Search Results:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {results.map((m: any) => (
                            <div
                              key={m.imdbID}
                              className="flex flex-col items-center text-center bg-white p-2 rounded shadow-sm hover:shadow-md transition"
                            >
                              {m.Poster !== 'N/A' && (
                                <img
                                  src={m.Poster}
                                  alt={m.Title}
                                  className="w-20 h-auto rounded mb-1"
                                />
                              )}
                              <p className="text-sm font-medium">{m.Title}</p>
                              <span className="text-xs text-gray-500">{m.Year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  case 'tool-recommendMovies': {
                    const recs = part.result;
                    if (!recs || recs.error || recs.length === 0)
                      return <div key={i}>No recommendations found.</div>;

                    return (
                      <div key={i} className="bg-green-50 border rounded-lg p-3">
                        <h4 className="font-semibold mb-2">Recommended Movies:</h4>
                        <div className="flex flex-wrap gap-3">
                          {recs.map((r: any, idx: number) => (
                            <div
                              key={idx}
                              className="w-24 flex flex-col items-center text-center bg-white p-2 rounded shadow-sm hover:shadow-md transition"
                            >
                              {r.Poster && (
                                <img
                                  src={r.Poster}
                                  alt={r.Title}
                                  className="w-20 h-auto rounded mb-1"
                                />
                              )}
                              <p className="text-xs font-medium">{r.Title}</p>
                              <span className="text-[10px] text-gray-500">{r.Year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4 fixed bottom-0 w-full max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput('');
          }}
          className="flex space-x-2"
        >
          <input
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ask about movies or ask for a dad joke"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-3 rounded-lg text-white ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Loading...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
