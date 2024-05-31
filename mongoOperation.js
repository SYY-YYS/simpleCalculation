import {MongoClient} from 'mongodb';


export async function connectToCluster(uri) {
    let mongoClient;

    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas');

        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}


export async function executeCrudOperation() {
    const uri = process.env.DB_URI;
    let mongoClient;

    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db("testapi");
        const collection = db.collection("userData");
        // const collection = 
        console.log("creating a colleciton")

        // createDocument(db, 'samuel', 'samuel123', 1.5)
        const userInfo = {
            username: 'samuel',
            password: 'samuel123',
            timeOfPlaying: 1,
            minTime: 1.5
        };
        const result = await db.collection("userData").insertOne(userInfo);

        console.log('succeeded!')
        

    } catch (error) {
        console.log('error: ', error)
    } finally {
        await mongoClient.close();

    }
};

// for new user
export async function createDocument(collection, username, password, minTime) {
       
    const userInfo = {
        username: username,
        password: password,
        timeOfPlaying: 1,
        minTime: minTime
    };

    await collection.insertOne(userInfo);
}

export async function checkExistenceOfRef(collection, ref) {
    return collection.find({ref: ref}).toArray();
}

export async function findRefBySerial(collection, serial) {
    return collection.find(
    {serial: serial}
    ).toArray();
    return answer
}

export async function updateSerialByRef(collection, ref, serialA) {
    await collection.updateMany(
        { ref },
        { $push: { serial: { $each: serialA}}}
    );
}

export async function deleteSerialsWRef(collection, ref, serialA) {
    await collection.updateMany(
        { },
        { $pull: {serial: { $in: serialA}}}
    );
}