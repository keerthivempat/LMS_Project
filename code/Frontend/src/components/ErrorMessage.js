// components/ErrorMessage.jsx
const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto max-w-xl mt-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorMessage;
