const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      characters: JSON.parse(localStorage.getItem("characters")) || [],
      token: null,
      name: "",
      apiUrl: "http://gateway.marvel.com/v1/public",
      endPoints: ["characters"],
      options: ["comics"],
      message: { text: "", type: false },
    },

    actions: {
      syncTokenFromSessionStore: () => {
        const token = localStorage.getItem("token");

        if (token && token != "" && token != undefined)
          setStore({ token: token });
      },

      toggleMessage: (text, type) => {
        setStore({ message: { text: text, type: type } });
      },

      login: async (email, password) => {
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/login`,
            opts
          );

          if (!response.ok) {
            const error = response.json();
            throw new Error(error.message);
          }
          const data = await response.json();
          localStorage.setItem("token", data.token);
          setStore({ token: data.token });
          setStore({ name: data.name });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      getCharacters: async () => {
        const store = getStore();
        if (localStorage.characters == undefined) {
          try {
            const response = await fetch(
              `${store.apiUrl}/characters?ts=${process.env.API_TS}&apikey=${process.env.API_KEY}&hash=${process.env.API_HASH}`
            );
            if (!response.ok) {
              const error = response.json();
              throw new Error(error.message);
            }
            const body = await response.json();
            console.log(body.data.results);
            setStore({ characters: body.data.results });
            localStorage.setItem(
              "characters",
              JSON.stringify(store.characters)
            );
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }
      },
    },
  };
};

export default getState;
