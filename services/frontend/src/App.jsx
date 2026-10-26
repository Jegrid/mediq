import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import WakeNotice from "./shared/components/WakeNotice";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <WakeNotice />
    </>
  );
}

export default App;
