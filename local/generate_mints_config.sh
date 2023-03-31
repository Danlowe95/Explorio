#!/usr/bin/env bash


printf "{\n\t\"mints\": [\n" > ./local/env.json
id=1
while (("$id" < "17"))
do
    var1=`spl-token create-token --decimals 0 | grep 'Creating token'|cut -f3 -d " "`
    spl-token authorize $var1 mint 78aJYueV3cvCDJBZwSuqimnRBqAqihqSchxpmy4K6mXN
    echo $var1
    echo $var2
    printf "\t\t{\n\t\t\t\"id\": $id,\n" >> ./local/env.json
    if (( $id == 16 ))
    then
        comma=""
    else
        comma=","
    fi
    printf "\t\t\t\"address\": \"$var1\"\n\t\t}$comma\n" >> ./local/env.json
    id=$(($id+1))
done

printf "\t]\n}\n" >> ./local/env.json

