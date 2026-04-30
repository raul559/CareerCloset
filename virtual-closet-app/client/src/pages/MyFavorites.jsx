import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";
import { useAuth } from "../utils/auth";
import { getFavorites, removeFavorite, invalidateFavoritesCache } from "../services/favoritesApi";
import "../styles/browse.css";

export default function MyFavorites() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { addToOutfit } = useOutfit();

    const [favoriteItems, setFavoriteItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/signin");
        }
    }, [isAuthenticated, user, navigate]);

    // Load favorites on mount
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        const loadFavorites = async () => {
            try {
                // Check again before fetching (in case user logged out)
                if (!isAuthenticated || !user) {
                    return;
                }

                // Invalidate cache before loading to ensure fresh data
                invalidateFavoritesCache();
                const items = await getFavorites();

                // Check again after fetch completes (in case user logged out while loading)
                if (!isAuthenticated || !user) {
                    return;
                }

                setFavoriteItems(items);
                setError(null);
            } catch (err) {
                // Check if error is due to logout (401) - if so, don't show error
                if (err.response?.status === 401) {
                    // User was logged out, redirect will happen via useEffect above
                    return;
                }
                setError("Failed to load your favorites. Please try again.");
                setFavoriteItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [isAuthenticated, user]);

    const handleRemoveFavorite = async (clothingId) => {
        try {
            await removeFavorite(clothingId);
            // Immediately remove from local state
            setFavoriteItems((prev) => {
                return prev.filter((item) => item.clothingId !== clothingId);
            });
            // Invalidate cache for next load
            invalidateFavoritesCache();
        } catch (err) {
            alert("Failed to remove favorite. Please try again.");
        }
    };

    if (loading) {
        return (
            <main className="browse-page" style={{ padding: "20px", textAlign: "center", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Loading your favorites...</p>
            </main>
        );
    }

    return (
        <main className="browse-page" style={{ padding: "20px" }}>
            <h1 style={{ marginBottom: "10px" }}>My Favorites</h1>

            {error && (
                <div
                    style={{
                        background: "#ffebee",
                        color: "#c62828",
                        padding: "12px",
                        borderRadius: "4px",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {favoriteItems.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        background: "#f5f5f5",
                        borderRadius: "8px",
                    }}
                >
                    <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "20px" }}>
                        You haven't saved any favorites yet.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/browse")}
                        style={{ padding: "10px 20px", fontSize: "1rem" }}
                    >
                        Browse Clothing
                    </button>
                </div>
            ) : (
                <>
                    <p style={{ marginBottom: "20px", color: "#666" }}>
                        You have <strong>{favoriteItems.length}</strong> saved item{favoriteItems.length !== 1 ? "s" : ""}
                    </p>
                    <div
                        className="browse-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {favoriteItems.map((item) => (
                            <article key={item.clothingId || item._id} className="card item-card">
                                <div style={{ position: "relative" }}>
                                    <img
                                        className="item-thumb-img"
                                        src={item.thumbnailWebpUrl || item.imageUrl || item.img}
                                        alt={`${item.name}, ${item.color}, size ${item.size}`}
                                        loading="lazy"
                                        style={{ width: "100%", height: "300px", objectFit: "cover" }}
                                    />
                                    <span className={`badge-chip ${item.status === "Unavailable" ? "unavailable" : ""}`}>
                                        {item.status || "Available"}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveFavorite(item.clothingId)}
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            left: 8,
                                            background: "#ff4757",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: 40,
                                            height: 40,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            fontSize: "1.2rem",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                            zIndex: 10,
                                        }}
                                        title="Remove from favorites"
                                    >
                                        ❤️
                                    </button>
                                </div>
                                <div className="item-body">
                                    <h3 className="item-title">{item.name}</h3>
                                    <p className="meta">
                                        {item.category} · {item.color} · Size {item.size} · #{item.clothingId}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
