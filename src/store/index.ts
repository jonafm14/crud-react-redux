import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import usersReducer, { rollbackUser } from "./users/slice";

const persistanceLocalStorage: Middleware = (store) => (next) => (action) => {
	next(action);
	localStorage.setItem("__redux__state__", JSON.stringify(store.getState()));
};

const syncWithDatabase: Middleware = (store) => (next) => (action) => {
	const { type, payload } = action;
	const previusState = store.getState();

	next(action);
	if (type === "users/deleteUserById") {
		const userIdToRemove = payload;
		const userToRemove = previusState.users.find(
			(user) => user.id === userIdToRemove,
		);

		fetch(`https://jsonplaceholder.typicode.com/users/${userIdToRemove}`, {
			method: "DELETE",
		})
			.then((res) => {
				if (res.ok) toast.success(`Usuario ${payload} eliminado correctamente`);
				throw new Error("Error al eliminar usuario");
			})
			.catch((err) => {
				toast.error(`Error al eliminar usuario ${userIdToRemove}`);
				if (userToRemove) store.dispatch(rollbackUser(userToRemove));
				console.log(err);
			});
	}
};

export const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	middleware: [persistanceLocalStorage, syncWithDatabase],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
