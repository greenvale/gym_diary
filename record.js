
let current_date = new Date("2024-10-20");

function formatDate(date)
{
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

$("#ex-date-selector .current-date").text(formatDate(current_date));

global_exercise_data = {
    10:{
        "ex_name":"Chest press", 
        "ex_type":"weight",
        "date":"2024-10-20",
        "ex_data": {
            "sets":{
                1:{"reps":10, "weight":30}, 
                2:{"reps":8, "weight":30}
            }, 
            "config":"cable", 
            "details":"pos 16"
        }
    },
    11:{
        "ex_name":"Leg press", 
        "ex_type":"weight",
        "date":"2024-10-20",
        "ex_data": {
            "sets":{
                1:{"reps":8, "weight":120}, 
                2:{"reps":6, "weight":120}, 
                3:{"reps":9, "weight":110}
            }, 
            "config":"machine", 
            "details":"seat pos 4"
        }
    }
};
next_id = 12;

/*
$.ajax({
    url: './record.php',
    method: 'POST',
    dataType: 'json',
    data:{
        action: "create_exercise",
        ex_type: global_exercise_data[11]["ex_type"],
        ex_name: global_exercise_data[11]["ex_name"],
        date: global_exercise_data[11]["date"],
        ex_data: global_exercise_data[11]["ex_data"]
    },
    success: function(response) {
        console.log(response); 
    },
    error: function(error) {
        console.log(`Error: ${error["responseText"]}`);
    }
});
*/

$("#ex-date-selector .left-arrow").click(() => {
    current_date.setDate(current_date.getDate() - 1);
    $("#ex-date-selector .current-date").text(formatDate(current_date));
});

$("#ex-date-selector .right-arrow").click(() => {
    current_date.setDate(current_date.getDate() + 1);
    $("#ex-date-selector .current-date").text(formatDate(current_date));
});


function create_editting_set_row(exercise_card, set_id, weight, reps)
{
    let set_row = $(`
        <tr class="set-${set_id}">
            <td class="idx"></td>
            <td><input class="weight" value="${weight}"></input></td>
            <td><input class="reps" value="${reps}"></input></td>
            <td class="no-border"><button class="del red">Delete</button></td>
        </tr>`);

    // add event for delete row button
    set_row.find("button.del").click(() =>
    {
        console.log(`Delete button pressed. Now removing ${set_id}`);
        delete exercise_card.data["sets"][set_id];
        $(`#ex-${exercise_card.id} table.set-data tr.set-${set_id}`).remove();
    });

    return set_row;
}


class ExerciseBoard
{
    constructor()
    {
        this.exercise_cards = {};

        /*
        $.each(global_exercise_data, (i,v) => {
            let exercise_card = new ExerciseCard(i, this, v["ex_type"], v["ex_name"], v["ex_data"]);
            $("#ex-container").append($(`<div id="ex-${exercise_card.id}" class="ex-card"></div>`));
            this.exercise_cards[i] = (exercise_card);
            this.exercise_cards[i].render();
        });
        */

        this.init();

    }

    async init() {
        try {
            let data = await this.fetch_data();
            console.log('Data received:', data);

            $.each(data["result"], (i,row) => {
                let ex_data = JSON.parse(row["ex_data"]);
                let exercise_card = new ExerciseCard(row["id"], this, row["ex_type"], row["ex_name"], ex_data);
                $("#ex-container").append($(`<div id="ex-${exercise_card.id}" class="ex-card"></div>`));
                this.exercise_cards[i] = (exercise_card);
                this.exercise_cards[i].render();
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    fetch_data() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: './record.php',
                method: 'POST',
                dataType: 'json',
                data:{
                    action:"get_exercise_by_date",
                    date:formatDate(current_date)
                },
                success: function(response) {
                    resolve(response);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    }

    delete_exercise(exercise_card)
    {
        console.log(`Request to delete exercise ${exercise_card.id}`)
        if (global_exercise_data.hasOwnProperty(exercise_card.id))
        {
            delete global_exercise_data[exercise_card.id];
            $(`#ex-${exercise_card.id}`).remove();
        }
        else
        {
            console.log(`Could not find exercise with id ${exercise_card.id}`);
        }
    }

    save_exercise(exercise_card)
    {
        /*
        if (global_exercise_data.hasOwnProperty(exercise_card.id))
        {
            global_exercise_data[exercise_card.id]["ex_name"] = exercise_card.name;
            global_exercise_data[exercise_card.id]["ex_type"] = exercise_card.type;
            global_exercise_data[exercise_card.id]["ex_data"] = exercise_card.data;    
        }
        else
        {
            console.log(`Could not find exercise with id ${exercise_card.id}`);
        }
        */
       
        $.ajax({
            url: './record.php',
            method: 'POST',
            dataType: 'json',
            data:{
                action:"edit_exercise",
                ex_id:exercise_card.id,
                ex_name:exercise_card.name,
                ex_type:exercise_card.type,
                ex_data:exercise_card.data
            },
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error["responseText"]);
            }
        });
        
    }

    new_exercise()
    {
        let id = next_id;
        console.log(`Creating new exercise with id ${id}`);
        next_id += 1;
        
        // creates a new blank exercise element
        global_exercise_data[id] = {"ex_name":"", "ex_type":"", "ex_data":{"sets":{}, "config":"", "details":""}};
        
        // create an exercise card with this board as its container board
        let exercise_card = new ExerciseCard(id, this, global_exercise_data[id]["ex_type"], 
            global_exercise_data[id]["ex_name"], global_exercise_data[id]["ex_data"]);
        
        this.exercise_cards[id] = exercise_card;
        this.exercise_cards[id].editting = true;

        // create html element and render card into html element
        $("#ex-container").append($(`<div id="ex-${id}" class="ex-card"></div>`));
        this.exercise_cards[id].render();
    }
}


class ExerciseCard
{
    constructor(id, board, type, name, data)
    {
        this.id = id;
        this.type = type;
        this.name = name;
        this.data = data;
        this.editting = false;
        this.board = board;
    }

    render()
    {
        let set_rows = [];
        if (this.editting)
        // EDITTING
        {
            let card = $(`
                <div style="margin:10px; text-align:right;">
                    <button class="save-ex large">Save</button>
                    <button class="del-ex large red">Delete exercise</button>
                </div>
                <table class="ex-header no-border">
                    <tr class="name">
                        <td>Exercise name</td>
                        <td><input class="name" value="${this.name}"></input></td>
                    </tr>
                    <tr class="type">
                        <td>Exercise type</td>
                        <td><input class="type" value="${this.type}"></input></td>
                    </tr>
                    <tr class="config">
                        <td>Configuration</td>
                        <td><input class="config" value="${this.data["config"]}"></input></td>
                    </tr>
                    <tr class="details">
                        <td>Details</td>
                        <td><input class="details" value="${this.data["details"]}"></input></td>
                    </tr>
                </table>
                <br>
                <table class="set-data">
                    <thead>
                        <th>#</th>
                        <th>Weight</th>
                        <th>Reps</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div style="margin:10px;"><button class="new-set">New set</button></div>
            `);
            
            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            // create rows of set table
            $.each(this.data["sets"], (set_id,v) => {
                let set_row = create_editting_set_row(this, set_id, v["weight"], v["reps"]);
                $(`#ex-${this.id} table.set-data tbody`).append($(set_row));
            });

            // add event for new set button
            $(`#ex-${this.id} button.new-set`).click(() => {
                let init_weight = 0;
                let init_reps = 0;
                let set_id = Math.max(...$.map(Object.keys(this.data["sets"]), Number)) + 1;
                console.log(`New set idx: ${set_id}`);
                this.data["sets"][set_id] = {"weight":init_weight, "reps":init_reps};
                let set_row = create_editting_set_row(this, set_id, init_weight, init_reps);
                $(`#ex-${this.id} table.set-data`).append($(set_row));
            });

            // add event for save changes button
            $(`#ex-${this.id} button.save-ex`).click(() => {

                this.name = $(`#ex-${this.id} table.ex-header input.name`).val();
                this.type = $(`#ex-${this.id} table.ex-header input.type`).val();
                this.data["config"] = $(`#ex-${this.id} table.ex-header input.config`).val();
                this.data["details"] = $(`#ex-${this.id} table.ex-header input.details`).val();
                
                $.each(this.data["sets"], (set_id,v) => {
                    this.data["sets"][set_id]["weight"] = $(`#ex-${this.id} table.set-data tr.set-${set_id} input.weight`).val();
                    this.data["sets"][set_id]["reps"] = $(`#ex-${this.id} table.set-data tr.set-${set_id} input.reps`).val();  
                });

                // sync the exercise card data with the server data
                this.board.save_exercise(this);

                this.editting = false;
                this.render();
            });
            
            // add event for the delete button
            $(`#ex-${this.id} button.del-ex`).click(() => {
                this.board.delete_exercise(this);
            });
        }
        else
        // NOT EDITTING
        {
            let card = $(`
                <div style="margin:10px; text-align:right;"><button class="edit-ex large">Edit</button></div>
                <h2 class="name">${this.name}</h2>
                <p class="config">${this.data["config"]}</p>
                <p class="details">${this.data["details"]}</p>
                <table class="set-data">
                    <thead>
                        <th>#</th>
                        <th>Weight</th>
                        <th>Reps</th>
                    </thead>
                </table>
            `);

            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            // create rows of set data table
            $.each(this.data["sets"], (set_id,v) => {
                let set_row = $(`
                    <tr class="set-${set_id}">
                        <td class="idx"></td>
                        <td class="weight">${v["weight"]}</td>
                        <td class="reps">${v["reps"]}</td>
                    </tr>`);
                $(`#ex-${this.id} table.set-data`).append($(set_row));
            });

            // add event for edit button
            $(`#ex-${this.id} button.edit-ex`).click(() => {
                this.editting = true;
                this.render();
            });
        }
    }
}


$(document).ready(function(){

    let exercise_board = new ExerciseBoard();

    $("#print-data").click(() => { 
        console.log(global_exercise_data);
    });
    
    $("#new-ex").click(() => {
        exercise_board.new_exercise();
    });
});