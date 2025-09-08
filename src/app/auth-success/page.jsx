//src / app / auth - success / page.jsx;
import { Suspense } from "react";
import GoogleCallbackPage from "./GoogleCallbackClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <GoogleCallbackPage />
    </Suspense>
  );
}
