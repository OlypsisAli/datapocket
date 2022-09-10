import "../styles/globals.css";
import { GeistProvider, CssBaseline } from "@geist-ui/core";

function MyApp({ Component, pageProps }) {
  return (
    <GeistProvider themeType={"dark"}>
      <CssBaseline />
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default MyApp;
