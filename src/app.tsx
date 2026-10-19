import { ColorModeProvider, ColorModeScript } from "@kobalte/core";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./app.css";
import { Header } from "./client/components/header/header";
import { Toaster } from "./client/components/ui/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>
            <ColorModeScript />
            <ColorModeProvider>
              <div class="min-h-screen flex flex-col">
                <Header />
                <main class="flex-1">{props.children}</main>
                <footer class="p-6 bg-background text-foreground mt-auto">
                  © 2026 Mi E-commerce
                </footer>
                <Toaster />
              </div>
            </ColorModeProvider>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
