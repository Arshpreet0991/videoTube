# 📺 Subscription Model Overview

### Structure:

- Each subscription has **two fields**:
  - **Subscriber** → the user who is subscribing
  - **Channel** → the user (or channel) being subscribed to
- **Both fields reference the User schema.**

---

### How it Works:

- Every time a user **subscribes** to a channel (another user), a **new document** is created in the **Subscription collection**.
- This means **multiple documents** will exist for the same channel, each representing a different subscriber.

---

### Querying:

- To **find all subscribers** of a channel:

  - Query all documents where the **Channel** field matches that user's ID.
  - **Count** the number of documents to get the **total subscriber count**.
  - **Example:**
    - Users A, B, and C subscribe to **Tekken 8**'s channel.
    - Query all documents where `Channel = Tekken 8`.
    - Result: 3 documents → 3 subscribers.

- To **find all channels** a user has subscribed to:
  - Query all documents where the **Subscriber** field matches that user's ID.
  - Fetch the list of channels from those documents.

---

### Key Points:

- **Every subscription is a separate document** (not embedded inside User).
- **Simple and scalable**: easy to query subscribers or subscriptions.
- **Relationship is two-way**:
  - Subscriber → Channels they follow
