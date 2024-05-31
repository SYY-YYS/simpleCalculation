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

export async function identityCheck(collection, username, password) {
    return await collection.find({ username: { $eq: username}, password: { $eq: password}}).toArray();
};


export async function executeCrudOperation(action, loggedin) {
    const uri = process.env.DB_URI;
    let mongoClient;

    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db("testapi");
        const collection = db.collection("userData");
        var loggedin = loggedin
        // const collection = 
        console.log("checking identity")

        switch (action) {
            case "checkIdentity":
                const backIdentity = await identityCheck(collection,'samuel3', 'samuel13');
                console.log(Object.keys(backIdentity).length != 0 ? backIdentity: "identity not found")
                break;
            case "add":
                const backUserInfo = await createDocument(collection, 'samuel5', 'samuel123', 1, 1.5, 2, 10)
                break;
            case "update":
                await updateData(collection, 'samuel4', 1, 1.5, 2, 10)
                break
        };
        console.log('succeeded ',action)
        

    } catch (error) {
        console.log('error: ', error)
    } finally {
        await mongoClient.close();

    }
};

// for new user (template)
export async function createDocument(collection, username, password, timesOfCalculating, minTime, averagetime, trialnumber) {
       
    const userInfo = {
        username: username,
        password: password,
        OperationStat: {
            [timesOfCalculating]: {
                averagetime: averagetime,
                mintime: minTime,
                trialnumber: trialnumber
            }
        },
        averageTimeOf1Calculation: averagetime,
        TotalTrialNumber: trialnumber,
        minTime: minTime
    };

    return await collection.insertOne(userInfo);
};

export async function updateData(collection, username, timesOfCalculating, minTime, averagetime, trialnumber) {
    // check if timesOfCalculatingminTime exists
    const checkTimesOfCalculating = await collection.find({
        username: username,
        OperationStat: { $exists: timesOfCalculating}
    }).toArray();
    console.log(Object.keys(checkTimesOfCalculating).length != 0 ?checkTimesOfCalculating : "timesOfCalculating not exists")
    
    if (Object.keys(checkTimesOfCalculating).length != 0) {
        // 1: timesOfCalculatingminTime exists
        await collection.find(
            {username: username}
        ).forEach(doc => {
            collection.updateOne(
                // averagetime, mintime, trialnumber & (total)
            )
            collection.save(doc)
        });
    } else {
    // 2: not exists

    };

};

// export async function checkExistenceOfRef(collection, ref) {
//     return collection.find({ref: ref}).toArray();
// }

// export async function findRefBySerial(collection, serial) {
//     return collection.find(
//     {serial: serial}
//     ).toArray();
//     return answer
// }



export async function deleteSerialsWRef(collection, ref, serialA) {
    await collection.updateMany(
        { },
        { $pull: {serial: { $in: serialA}}}
    );
}