import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "./store";

export function renderWithProviders(
  ui,
  { preloadedState, store = createStore(preloadedState), route = "/" } = {},
) {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
