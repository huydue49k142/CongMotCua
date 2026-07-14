---
name: mongodb
description: MongoDB database patterns covering document modeling, aggregation pipelines, indexing strategies, and performance optimization.
---

# MongoDB

## Overview

MongoDB is a document-oriented NoSQL database. This skill covers document modeling, aggregation pipelines, indexing strategies, and performance optimization for MongoDB.

## When to Use

- Working with MongoDB databases
- Designing document schemas
- Building aggregation pipelines
- Optimizing MongoDB performance
- Implementing MongoDB security

## Core Concepts

### Document Structure

```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "orders": [
    {
      "orderId": "ORD001",
      "total": 99.99,
      "items": ["item1", "item2"]
    }
  ],
  "createdAt": ISODate("2024-01-01T00:00:00Z")
}
```

### Data Modeling

#### Embedding vs Referencing

**Embed** when:
- Data is accessed together
- One-to-few relationship
- Data doesn't change frequently

```javascript
// ✅ Good: Embed comments in post
{
  title: "Post Title",
  content: "Post content",
  comments: [
    { author: "User1", text: "Great post!" },
    { author: "User2", text: "Thanks!" }
  ]
}
```

**Reference** when:
- One-to-many or many-to-many
- Data accessed independently
- Data changes frequently

```javascript
// ✅ Good: Reference users in posts
// Post document
{
  title: "Post Title",
  authorId: ObjectId("...")
}

// User document
{
  name: "John",
  postIds: [ObjectId("..."), ObjectId("...")]
}
```

## CRUD Operations

### Create

```javascript
// Insert one
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});

// Insert many
db.users.insertMany([
  { name: "John", email: "john@example.com" },
  { name: "Jane", email: "jane@example.com" }
]);
```

### Read

```javascript
// Find all
db.users.find();

// Find with filter
db.users.find({ age: { $gte: 18 } });

// Find one
db.users.findOne({ email: "john@example.com" });

// Projection - select specific fields
db.users.find(
  { age: { $gte: 18 } },
  { name: 1, email: 1, _id: 0 }
);

// Sort and limit
db.users.find()
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(20);
```

### Update

```javascript
// Update one
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { age: 31 } }
);

// Update many
db.users.updateMany(
  { status: "inactive" },
  { $set: { status: "active" } }
);

// Upsert (update or insert)
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { name: "John", age: 30 } },
  { upsert: true }
);
```

### Delete

```javascript
// Delete one
db.users.deleteOne({ email: "john@example.com" });

// Delete many
db.users.deleteMany({ status: "inactive" });
```

## Query Operators

### Comparison

```javascript
// Equal
{ age: 30 }

// Not equal
{ age: { $ne: 30 } }

// Greater than
{ age: { $gt: 18 } }

// Greater than or equal
{ age: { $gte: 18 } }

// Less than
{ age: { $lt: 65 } }

// In array
{ status: { $in: ["active", "pending"] } }
```

### Logical

```javascript
// AND (implicit)
{ age: { $gte: 18 }, status: "active" }

// OR
{
  $or: [
    { age: { $lt: 18 } },
    { status: "vip" }
  ]
}

// NOT
{ status: { $not: { $eq: "inactive" } } }
```

### Array

```javascript
// Element in array
{ tags: "mongodb" }

// All elements
{ tags: { $all: ["mongodb", "database"] } }

// Array size
{ tags: { $size: 3 } }
```

## Aggregation Pipeline

### Basic Pipeline

```javascript
db.orders.aggregate([
  // Stage 1: Match
  { $match: { status: "completed" } },
  
  // Stage 2: Group
  { 
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" },
      orderCount: { $sum: 1 }
    }
  },
  
  // Stage 3: Sort
  { $sort: { totalSpent: -1 } },
  
  // Stage 4: Limit
  { $limit: 10 }
]);
```

### Common Stages

```javascript
// $lookup - Join collections
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" }
]);

// $project - Reshape documents
db.users.aggregate([
  {
    $project: {
      name: 1,
      email: 1,
      yearJoined: { $year: "$createdAt" }
    }
  }
]);

// $group - Group and aggregate
db.sales.aggregate([
  {
    $group: {
      _id: { $month: "$date" },
      totalSales: { $sum: "$amount" },
      avgSale: { $avg: "$amount" }
    }
  }
]);
```

## Indexing

### Create Indexes

```javascript
// Single field index
db.users.createIndex({ email: 1 });

// Compound index
db.orders.createIndex({ customerId: 1, createdAt: -1 });

// Unique index
db.users.createIndex({ email: 1 }, { unique: true });

// Text index for search
db.posts.createIndex({ title: "text", content: "text" });

// TTL index for auto-deletion
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
);
```

### Index Types

```javascript
// Partial index - index subset
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { status: "active" } }
);

// Sparse index - only documents with field
db.users.createIndex(
  { phone: 1 },
  { sparse: true }
);

// Covered query - all data from index
db.users.createIndex(
  { email: 1 },
  { include: [name, age] }
);
```

## Performance

### Explain Plans

```javascript
// Analyze query performance
db.users.find({ email: "john@example.com" }).explain("executionStats");

// Look for:
// - "stage": "IXSCAN" (good - using index)
// - "stage": "COLLSCAN" (bad - full collection scan)
// - "executionTimeMillis" (should be low)
```

### Optimization Tips

```javascript
// ✅ Good: Uses index
db.users.find({ email: "john@example.com" });

// ❌ Bad: Function prevents index
db.users.find({ $toLower: "$email": "john@example.com" });

// ✅ Good: Covered query
db.users.createIndex({ email: 1 }, { include: [name] });
db.users.find({ email: "..." }, { name: 1, _id: 0 });

// ❌ Bad: Unindexed regex
db.users.find({ name: { $regex: /^John/ } });

// ✅ Good: Indexed regex
db.users.createIndex({ name: 1 });
db.users.find({ name: { $regex: /^John/ } });
```

## Transactions

```javascript
// Multi-document transaction
const session = client.startSession();

try {
  session.startTransaction();
  
  await db.users.updateOne(
    { _id: userId },
    { $inc: { balance: -100 } },
    { session }
  );
  
  await db.orders.insertOne(
    { userId, amount: 100 },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

## Security

### Authentication

```javascript
// Enable authentication in mongod.conf
// security:
//   authorization: enabled
```

### Role-Based Access

```javascript
// Create user with read-only role
db.createUser({
  user: "app_user",
  pwd: "password",
  roles: [{ role: "readWrite", db: "myapp" }]
});

// Create admin user
db.createUser({
  user: "admin",
  pwd: "password",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
});
```

## Best Practices

1. **Design for access patterns**: Model documents for how they're queried
2. **Use embedding wisely**: Embed for one-to-few, reference for one-to-many
3. **Index strategically**: Index frequently queried fields
4. **Avoid large documents**: Keep under 16MB limit
5. **Use aggregation pipeline**: For complex data processing
6. **Enable authentication**: Always require authentication
7. **Use connection pooling**: Reuse connections
8. **Monitor performance**: Use MongoDB Atlas or mongostat

## Anti-Patterns

- **Over-embedding**: Large arrays that grow unbounded
- **Under-indexing**: Slow queries on unindexed fields
- **Large documents**: Exceeding 16MB limit
- **Unbounded arrays**: Arrays with thousands of elements
- **No pagination**: Returning entire collections
- **Ignoring explain plans**: Not understanding query performance

## Verification

- [ ] Document schema designed for access patterns
- [ ] Indexes created for common queries
- [ ] Aggregation pipelines optimized
- [ ] Authentication enabled
- [ ] Connection pooling configured
- [ ] Performance monitored
- [ ] Backup strategy in place

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.