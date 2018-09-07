import Realm from "realm";

// CONSTANTS
const USER_SCHEMA = "user";
const AUTH_SCHEMA = "auth";

const userSchema = {
    name: USER_SCHEMA,
    properties: {
        username: { type: "string" },
        authType: { type: "string" },
        postingKey: { type: "string" },
        activeKey: { type: "string" },
        memoKey: { type: "string" },
        masterKey: { type: "string" },
    },
};

const authSchema = {
    name: AUTH_SCHEMA,
    properties: {
        isLoggedIn: { type: "bool", default: false },
    },
};

let realm = new Realm({ schema: [userSchema, authSchema] });

export const getUserData = () => {
    return new Promise((resolve, reject) => {
        try {
            let user = realm.objects(USER_SCHEMA);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
};

export const setUserData = userData => {
    return new Promise((resolve, reject) => {
        try {
            realm.write(() => {
                realm.create(userSchema.name, userData);
                resolve(userData);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const removeUserData = () => {
    return new Promise((resolve, reject) => {
        setAuthStatus({ isLoggedIn: true }).then(() => {
            try {
                realm.write(() => {
                    realm.deleteAll();
                });
                resolve();
            } catch (error) {
                alert(error);
                reject(error);
            }
        });
    });
};

export const getAuthStatus = () => {
    return new Promise((resolve, reject) => {
        try {
            let auth = realm.objects(AUTH_SCHEMA);
            if (auth["0"]) {
                resolve(auth["0"].isLoggedIn);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

export const setAuthStatus = authStatus => {
    return new Promise((resolve, reject) => {
        try {
            realm.write(() => {
                realm.create(authSchema.name, authStatus);
                resolve(authStatus);
            });
        } catch (error) {
            alert(error);
            reject(error);
        }
    });
};
