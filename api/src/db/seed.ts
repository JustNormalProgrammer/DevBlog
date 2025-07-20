import { db } from "./index";
import { users, posts, comments } from "./schema";

async function seed() {
  const insertedUsers = await db
    .insert(users)
    .values([
      { username: "alice", password: "password123", isAdmin: true },
      { username: "bob", password: "securepass", isAdmin: false },
      { username: "carol", password: "123456", isAdmin: false },
      { username: "dave", password: "pass1", isAdmin: false },
      { username: "eve", password: "pass2", isAdmin: false },
      { username: "frank", password: "pass3", isAdmin: false },
      { username: "grace", password: "pass4", isAdmin: false },
      { username: "heidi", password: "pass5", isAdmin: false },
      { username: "ivan", password: "pass6", isAdmin: false },
      { username: "judy", password: "pass7", isAdmin: false },
    ])
    .returning();

  const insertedPosts = await db
    .insert(posts)
    .values([
      {
        userId: insertedUsers[0].id,
        title: "Pierwszy post Alice",
        content: "To jest zawartość pierwszego posta.",
        isPublic: true,
      },
      {
        userId: insertedUsers[1].id,
        title: "Post Boba",
        content: "Cześć, to Bob!",
        isPublic: false,
      },
      {
        userId: insertedUsers[2].id,
        title: "Post Carol",
        content: "Carol pisze coś ciekawego.",
        isPublic: true,
      },
      {
        userId: insertedUsers[3].id,
        title: "Post Dave’a",
        content: "Nowy wpis od Dave’a.",
        isPublic: true,
      },
      {
        userId: insertedUsers[4].id,
        title: "Eve testuje system",
        content: "Test, test. Czy działa?",
        isPublic: false,
      },
      {
        userId: insertedUsers[5].id,
        title: "Frank mówi hej",
        content: "Hej wszystkim!",
        isPublic: true,
      },
      {
        userId: insertedUsers[6].id,
        title: "Grace analizuje dane",
        content: "Analiza danych to ciekawa sprawa.",
        isPublic: true,
      },
      {
        userId: insertedUsers[7].id,
        title: "Heidi programuje",
        content: "Kodowanie w JavaScript.",
        isPublic: false,
      },
      {
        userId: insertedUsers[8].id,
        title: "Ivan i jego podróże",
        content: "Relacja z wycieczki.",
        isPublic: true,
      },
      {
        userId: insertedUsers[9].id,
        title: "Judy gotuje",
        content: "Dzisiaj robię lasagne.",
        isPublic: true,
      },
    ])
    .returning();

  await db.insert(comments).values([
    // Post 0 (3 comments)
    {
      userId: insertedUsers[1].id,
      postId: insertedPosts[0].id,
      content: "Świetny post, Alice!",
    },
    {
      userId: insertedUsers[2].id,
      postId: insertedPosts[0].id,
      content: "Zgadzam się z Bobem!",
    },
    {
      anonymousAuthorName: "Anon",
      postId: insertedPosts[0].id,
      content: "Dzięki za wpis!",
    },

    // Post 1 (1 comment)
    {
      userId: insertedUsers[3].id,
      postId: insertedPosts[1].id,
      content: "Cześć Bob!",
    },

    // Post 2 (2 comments)
    {
      userId: insertedUsers[4].id,
      postId: insertedPosts[2].id,
      content: "Super Carol!",
    },
    {
      anonymousAuthorName: "Gość",
      postId: insertedPosts[2].id,
      content: "Dobrze napisane!",
    },

    // Post 3 (0 comments)

    // Post 4 (1 comment)
    {
      userId: insertedUsers[0].id,
      postId: insertedPosts[4].id,
      content: "Działa!",
    },

    // Post 5 (4 comments)
    {
      userId: insertedUsers[6].id,
      postId: insertedPosts[5].id,
      content: "Cześć Frank!",
    },
    {
      userId: insertedUsers[7].id,
      postId: insertedPosts[5].id,
      content: "Miło Cię widzieć!",
    },
    {
      userId: insertedUsers[8].id,
      postId: insertedPosts[5].id,
      content: "Dzięki za wiadomość!",
    },
    {
      anonymousAuthorName: "Nieznany",
      postId: insertedPosts[5].id,
      content: "Hej hej!",
    },

    // Post 6 (2 comments)
    {
      userId: insertedUsers[9].id,
      postId: insertedPosts[6].id,
      content: "Zgadzam się z analizą.",
    },
    {
      anonymousAuthorName: "Statystyk",
      postId: insertedPosts[6].id,
      content: "Ciekawy punkt widzenia.",
    },

    // Post 7 (0 comments)

    // Post 8 (3 comments)
    {
      userId: insertedUsers[0].id,
      postId: insertedPosts[8].id,
      content: "Super relacja!",
    },
    {
      userId: insertedUsers[1].id,
      postId: insertedPosts[8].id,
      content: "Gdzie byłeś?",
    },
    {
      anonymousAuthorName: "Podróżnik",
      postId: insertedPosts[8].id,
      content: "Też tam byłem!",
    },

    // Post 9 (1 comment)
    {
      userId: insertedUsers[2].id,
      postId: insertedPosts[9].id,
      content: "Smacznego Judy!",
    },
  ]);

  console.log("Dane zostały dodane.");
}

seed().catch((err) => {
  console.error("Error: ", err);
});
