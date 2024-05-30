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


export async function executeCrudOperation(action, ref, serial, num = 1) {
    const uri = process.env.DB_URI;
    let mongoClient;
    let doc;

    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('testapi');

        
    } catch {
        console.log('error')
    } finally {
        await mongoClient.close();

    }
}

export async function createRefDocument(collection, ref, serial) {
       
    const refDocument = {
        ref: ref,
        serial: serial,
    };

    await collection.insertOne(refDocument);
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