import mongoose from 'mongoose';
import User from './src/models/user.js';
import Favorite from './src/models/Favorite.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateFavorites() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/career-closet');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // For each user, update their favorites to use email instead of _id
    let migrated = 0;
    for (const user of users) {
      if (!user.email) continue;

      // Find all favorites with this user's _id
      const favoritesWithId = await Favorite.find({ userId: user._id.toString() });
      
      if (favoritesWithId.length > 0) {
        console.log(`Migrating ${favoritesWithId.length} favorites for user ${user.email}`);
        
        // Update all to use email
        await Favorite.updateMany(
          { userId: user._id.toString() },
          { userId: user.email }
        );
        
        migrated += favoritesWithId.length;
      }
    }

    console.log(`✅ Migration complete! Updated ${migrated} favorites`);

    // Verify: show favorites count by userId format
    const pipeline = [
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: '$userId', regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' } },
              'email',
              'id'
            ]
          },
          count: { $sum: 1 }
        }
      }
    ];

    const result = await Favorite.aggregate(pipeline);
    console.log('\nVerification - Favorites by userId format:');
    result.forEach(r => {
      console.log(`  ${r._id}: ${r.count} favorites`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateFavorites();
