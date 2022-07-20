import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Container } from "@mui/system";
import { useState } from "react";
import Catalog from "../../features/catalog/Catalog";
import Header from "./Header";

function App() {
  const [darkMode,setDarkMode] = useState(false);
  const paletteType = darkMode?'dark':'light';
  const theme = createTheme({
    palette:{
      mode:paletteType,
      background:{
        default:paletteType==='light'?'#eaeaea':'#121212'
      }
    }
  })

  return (
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <Header isDarkMode={darkMode} setDarkMode={()=>setDarkMode(!darkMode)}/>
      <Container>
        <Catalog  />
      </Container>
    </ThemeProvider>
  );
}

export default App;
