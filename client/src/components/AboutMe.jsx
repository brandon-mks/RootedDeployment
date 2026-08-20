import { useAuth } from "../Context/AuthContext";

const AboutMe = () => {
  const { user, favorites, removeFavorite } = useAuth();

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>User ID: {user.id}</p>
      <p>Username: {user.username}</p>
      <hr />
      {favorites.length === 0 ? (
        <div>
          <p>No favorites, go add some!</p>
        </div>
      ) : (
        <div>
          {favorites.map((fav) => {
            return (
              <div key={fav.fav_id}>
                <p>{fav.name}</p>
                <button
                  onClick={() => {
                    removeFavorite(fav.fav_id);
                  }}
                >
                  Remove from Favorites
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AboutMe;
