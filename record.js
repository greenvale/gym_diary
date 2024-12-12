
global_exercise_data = {
    10:{
        "exercise_name":"Chest press", 
        "exercise_type":"weight", 
        "data": {
            "sets":[
                {"reps":10, "weight":30}, 
                {"reps":8, "weight":30}
            ], 
            "config":"cable", 
            "details":"pos 16"
        }
    },
    11:{
        "exercise_name":"Leg press", 
        "exercise_type":"weight",
        "data": {
            "sets":[
                {"reps":8, "weight":120}, 
                {"reps":6, "weight":120}, 
                {"reps":9, "weight":110}
            ], 
            "config":"machine", 
            "details":"seat pos 4"
        }
    }
};
next_id = 12;


function create_editting_set_row(exercise_id, set_idx, weight, reps)
{
    let set_row = $(`
        <tr class="set-${set_idx}">
            <td class="idx">${set_idx+1}</td>
            <td><input class="weight" value="${weight}"></input></td>
            <td><input class="reps" value="${reps}"></input></td>
            <td><button class="del">Delete</button></td>
        </tr>`);

    // add event for delete row button
    set_row.find("button.del").click(() =>
    {
        this.data["sets"].splice(set_idx, 1);
        $(`#ex-${exercise_id} tr.set-${i}`).remove();
    });

    return set_row;
}


class ExerciseBoard
{
    constructor()
    {
        this.exercise_cards = {};

        $.each(global_exercise_data, (i,v) => {
            let exercise_card = new ExerciseCard(i, this, v["exercise_type"], v["exercise_name"], v["data"]);
            $("#ex-container").append($(`<div id="ex-${exercise_card.id}" class="ex-card"></div>`));
            this.exercise_cards[i] = (exercise_card);
            this.exercise_cards[i].render();
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
        if (global_exercise_data.hasOwnProperty(exercise_card.id))
        {
            global_exercise_data[exercise_card.id]["exercise_name"] = exercise_card.name;
            global_exercise_data[exercise_card.id]["exercise_type"] = exercise_card.type;
            global_exercise_data[exercise_card.id]["data"] = exercise_card.data;    
        }
        else
        {
            console.log(`Could not find exercise with id ${exercise_card.id}`);
        }
    }

    new_exercise()
    {
        let id = next_id;
        console.log(`Creating new exercise with id ${id}`);
        next_id += 1;
        
        // creates a new blank exercise element
        global_exercise_data[id] = {"exercise_name":"", "exercise_type":"", "data":{"sets":[], "config":"", "details":""}};
        
        // create an exercise card with this handler as its handler
        let exercise_card = new ExerciseCard(id, this, global_exercise_data[id]["exercise_type"], 
            global_exercise_data[id]["exercise_name"], global_exercise_data[id]["data"]);
        
        this.exercise_cards[id] = exercise_card;
        this.exercise_cards[id].editting = true;

        // create html element and render card into html element
        $("#ex-container").append($(`<div id="ex-${id}" class="ex-card"></div>`));
        this.exercise_cards[id].render();
    }
}


class ExerciseCard
{
    constructor(id, handler, type, name, data)
    {
        this.id = id;
        this.type = type;
        this.name = name;
        this.data = data;
        this.editting = false;
        this.handler = handler;
    }

    render()
    {
        let set_rows = [];
        if (this.editting)
        // EDITTING
        {
            // create rows of set data table
            $.each(this.data["sets"], (set_idx,v) => {
                let set_row = create_editting_set_row(this.id, set_idx, v["weight"], v["reps"])
                set_rows.push(set_row);
            });
    
            let card = $(`
                <table class="ex-header">
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
                </table>
                <button class="new-set">New set</button>
                <br>
                <button class="save-ex">Save</button>
                <button class="del-ex">Delete exercise</button>
            `);
            
            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            // add set data rows to the set data table
            $.each(set_rows, (i,row) => {
                $(`#ex-${this.id} table.set-data`).append($(row));
            });

            // add event for new set button
            $(`#ex-${this.id} button.new-set`).click(() => {
                let init_weight = 0;
                let init_reps = 0;
                this.data["sets"].push({"weight":init_weight, "reps":init_reps});
                let set_idx = this.data["sets"].length - 1;
                let set_row = create_editting_set_row(this.id, set_idx, init_weight, init_reps);
                $(`#ex-${this.id} table.set-data`).append($(set_row));
            });

            // add event for save changes button
            $(`#ex-${this.id} button.save-ex`).click(() => {

                this.name = $(`#ex-${this.id} table.ex-header input.name`).val();
                this.type = $(`#ex-${this.id} table.ex-header input.type`).val();
                this.data["config"] = $(`#ex-${this.id} table.ex-header input.config`).val();
                this.data["details"] = $(`#ex-${this.id} table.ex-header input.details`).val();
                
                for (let set_idx = 0; set_idx < this.data["sets"].length; set_idx++)
                {
                    this.data["sets"][set_idx]["weight"] = $(`#ex-${this.id} table.set-data tr.set-${set_idx} input.weight`).val();
                    this.data["sets"][set_idx]["reps"] = $(`#ex-${this.id} table.set-data tr.set-${set_idx} input.reps`).val();    
                }

                // sync the exercise card data with the server data
                this.handler.save_exercise(this);

                this.editting = false;
                this.render();
            });
            
            // add event for the delete button
            $(`#ex-${this.id} button.del-ex`).click(() => {
                this.handler.delete_exercise(this);
            });
        }
        else
        // NOT EDITTING
        {
            // create rows of set data table
            $.each(this.data["sets"], (i,v) => {
                let set_row = $(`
                    <tr class="set-${i}">
                        <td class="idx">${i+1}</td>
                        <td class="weight">${v["weight"]}</td>
                        <td class="reps">${v["reps"]}</td>
                    </tr>`);
                
                set_rows.push(set_row);
            });
    
            let card = $(`
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
                <button class="edit-ex">Edit</button>
            `);

            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            // add set data rows to the set data table
            $.each(set_rows, (i,row) => {
                $(`#ex-${this.id} table.set-data`).append($(row));
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