import * as React from "react";
import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "../src/Link";
import ProTip from "../src/ProTip";
import Copyright from "../src/Copyright";
import { Button } from "@mui/material";

const Home: NextPage = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flex: "1 1 0",
        my: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flex: "1 1 0",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{}}>
          Slime
        </Typography>
        <Button variant="contained" component={Link} noLinkStyle href="/">
          Go to the home page
        </Button>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
};

export default Home;
