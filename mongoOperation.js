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
                const backUserInfo = await createDocument(collection, 'samuel6', 'samuel1236', 1, 1.5, 2, 10)
                break;
            case "update":
                await updateData(collection, 'samuel6', 3, 0.9, 1.5, 10)
                break;
            case "delete":
                await deleteOneUser(collection, "samuel5")
                break;
            case "checkCurrentSize":
                let collectionCount = await checkCurrentSize(collection);
                console.log(collectionCount)
                break;
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
    // timesOfCalculating to string for dotation
    timesOfCalculating = timesOfCalculating.toString();
    
    let checkTimesDotnotation = `OperationStat.${timesOfCalculating}`;

    // check if timesOfCalculatingminTime exists
    const checkTimesOfCalculating = await collection.find({
        username: username,
        [checkTimesDotnotation]: { $exists: true}
    }).toArray();
    console.log(Object.keys(checkTimesOfCalculating).length != 0 ?checkTimesOfCalculating : "timesOfCalculating not exists")
    
    if (Object.keys(checkTimesOfCalculating).length != 0) {
        // 1: timesOfCalculatingminTime exists
        const ThreeeKs = await collection.find(
            {username: username}
        ).map(async function(doc) {
            // console.log(doc)
            const Kaveragetime = doc.OperationStat[timesOfCalculating].averagetime;
            const Kmintime = doc.OperationStat[timesOfCalculating].mintime;
            const Ktrialnumber = doc.OperationStat[timesOfCalculating].trialnumber;
            const Ktotalaveragetime = doc.averageTimeOf1Calculation;
            const Ktotaltrialnumber = doc.TotalTrialNumber;
            console.log(Kaveragetime,Kmintime,Ktrialnumber,Ktotalaveragetime,Ktotaltrialnumber);

            return [Kaveragetime,Kmintime,Ktrialnumber,Ktotalaveragetime,Ktotaltrialnumber];
        }).toArray();
        
        const [Kaveragetime,Kmintime,Ktrialnumber,Ktotalaveragetime,Ktotaltrialnumber] = [...ThreeeKs[0]]

        // a function to lessen the variables for dotnotation
        function addingVariableToDotNotation(suffix) {
            return `OperationStat.${timesOfCalculating}.${suffix}`;
        };

        // let dotaverageTime = `OperationStat.${timesOfCalculating}.averagetime`;

        let calaverageTime = (Kaveragetime*Ktrialnumber+averagetime*trialnumber)/(Ktrialnumber + trialnumber)
        let caltotalaverageTime = (Ktotalaveragetime*Ktotaltrialnumber+averagetime*trialnumber)/(Ktotaltrialnumber + trialnumber)
        
        await collection.updateOne(
            
            {username: username},
            // first try adding trialnumber using doc
            { $set: {[addingVariableToDotNotation('averagetime')] : calaverageTime, 
             averageTimeOf1Calculation : caltotalaverageTime},

             $inc: {[addingVariableToDotNotation('trialnumber')]: trialnumber,
             TotalTrialNumber: trialnumber},

             $min: {[addingVariableToDotNotation('mintime')]: minTime,
             minTime: minTime
             }
            }
        )
    } else {
    // 2: not exists

    const ThreeeKs = await collection.find(
        {username: username}
    ).map(async function(doc) {

        const Ktotalaveragetime = doc.averageTimeOf1Calculation;
        const Ktotaltrialnumber = doc.TotalTrialNumber;
        console.log(Ktotalaveragetime,Ktotaltrialnumber);

        return [Ktotalaveragetime,Ktotaltrialnumber];
    }).toArray();
    const [Ktotalaveragetime,Ktotaltrialnumber] = [...ThreeeKs[0]]

    let pushingDotnotation = `OperationStat.${timesOfCalculating}`;
    let caltotalaverageTime = (Ktotalaveragetime*Ktotaltrialnumber+averagetime*trialnumber)/(Ktotaltrialnumber + trialnumber)

    await collection.updateOne(
        {username: username},
        { $set: {[pushingDotnotation]: {
            averagetime: averagetime,
            mintime: minTime,
            trialnumber: trialnumber
        }, averageTimeOf1Calculation : caltotalaverageTime},

        $inc: {TotalTrialNumber: trialnumber},

        $min: {minTime: minTime}
        }
    );
    };

};

export async function deleteOneUser(collection, username) {
    return await collection.deleteOne({username: username});
};

export async function checkCurrentSize(collection) {
    return await collection.count()
}

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