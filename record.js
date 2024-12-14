let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let equipment = ["Dumbbell", "Barbell", "Machine", "Cable"];

function formatDate(date, style="US")
{
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    if (style == "US")
    {
        return `${year}-${month}-${day}`;
    }
    else if (style == "UK")
    {
        return `${day}/${month}/${year}`;
    }
}


// creates a table row element for the weight training set table in editting form
// this function avoids code duplication
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

        // delete the set from the set dictionary
        delete exercise_card.data["sets"][set_id];
        
        // remove the row for this set
        $(`#ex-${exercise_card.id} table.set-data tr.set-${set_id}`).remove();
        
        if (Object.keys(exercise_card.data["sets"]).length == 0)
        {
            // if there are no other sets then hide the empty table
            $(`#ex-${exercise_card.id} table.set-data`).addClass("hidden");
        }
        else
        {
            // label the rows of the set table
            $(`#ex-${exercise_card.id} table.set-data tbody tr`).each((i,row) => {
                $(row).find(`td.idx`).text(i + 1);
            });
        }
    });

    return set_row;
}


class ExerciseBoard
{
    constructor(current_date)
    {
        this.current_date = current_date;
        this.exercise_cards = {};
        this.init();
    }

    async init() {
        try {
            let data = await this.fetch_data();
            console.log('Initial data received:', data);

            // empty the exercise container of its contents
            $("#ex-weight-container").empty();
            $("#ex-cardio-container").empty();

            // create exercise cards for the existing data for this date and user
            $.each(data["result"], (i,row) => {
                let exercise_card = new ExerciseCard(row["ex_id"], this, row["ex_type"], row["ex_name"], JSON.parse(row["ex_data"]));
                $(`#ex-${row["ex_type"]}-container`).append($(`<div id="ex-${exercise_card.id}" class="ex-card"></div>`));
                this.exercise_cards[row["ex_id"]] = exercise_card;
                this.exercise_cards[row["ex_id"]].render();
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
                    ex_date:formatDate(this.current_date)
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
        $.ajax({
            url: './record.php',
            method: 'POST',
            dataType: 'json',
            data:{
                action:"delete_exercise",
                ex_id:exercise_card.id
            },
            success: (response) => {
                console.log(response);
                $(`#ex-${exercise_card.id}`).remove();
                delete this.exercise_cards[exercise_card.id];
            },
            error: function(error) {
                console.log(error["responseText"]);
            }
        });
    }

    save_exercise(exercise_card)
    {
        $.ajax({
            url: './record.php',
            method: 'POST',
            dataType: 'json',
            data:{
                action:"edit_exercise",
                ex_id:exercise_card.id,
                ex_name:exercise_card.name,
                ex_type:exercise_card.type,
                ex_data:JSON.stringify(exercise_card.data)
            },
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error["responseText"]);
            }
        });
        
    }

    new_exercise(exercise_type)
    {
        let init_name = "";
        $.ajax({
            url: './record.php',
            method: 'POST',
            dataType: 'json',
            data:{
                action: "create_exercise",
                ex_date: formatDate(this.current_date),
                ex_name: init_name,
                ex_type: exercise_type,
                ex_data: JSON.stringify({"sets":{}, "config":"", "details":""})
            },
            success: (response) => {
                console.log(response);
                let exercise_card = new ExerciseCard(response["ex_id"], this, exercise_type, init_name,
                    {"sets":{}, "config":"", "details":""});
                this.exercise_cards[response["ex_id"]] = exercise_card;
                this.exercise_cards[response["ex_id"]].editting = true;
                $(`#ex-${exercise_type}-container`).append($(`<div id="ex-${response["ex_id"]}" class="ex-card"></div>`));
                this.exercise_cards[response["ex_id"]].render();
            },
            error: function(error) {
                console.log(error["responseText"]);
            }
        });
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
        if (this.editting)
        // EDITTING
        {
            let card = $(`
                <div class="ex-header-edit">
                    <div class="error-feedback"></div>
                    <button class="save-ex large">Save</button>
                    <button class="del-ex large red">Delete exercise</button>
                </div>
                
                <div class="label-input-pair">
                    <label for="ex-${this.id}-equip-dropdown">Equipment</label>
                    <select id="ex-${this.id}-equip-dropdown" class="equip-dropdown"></select>
                </div>

                <div class="label-input-pair">
                    <label for="ex-${this.id}-ex-name">Exercise name</label>
                    <input id="ex-${this.id}-ex-name" class="name" value="${this.name}"></input>
                </div>
                
                <div class="label-input-pair">
                    <label for="ex-${this.id}-ex-details">Details</label>
                    <input id="ex-${this.id}-ex-details" class="details" value="${this.data["details"]}"></input>
                </div>

                <div class="set-table-container">
                    <table class="set-data">
                        <thead>
                            <th>#</th>
                            <th>Weight</th>
                            <th>Reps</th>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div style="height:10px;"></div>
                    <button class="new-set">Add new set</button>
                </div>

            `);
            
            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            // add the equipment options to the dropdown menu
            $.each(equipment, (i,v) => {
                $(`#ex-${this.id} select.equip-dropdown`).append($(`<option value="${v}" ${this.data["config"]==v?"selected":""}>${v}</option>`));
            });

            if (Object.keys(this.data["sets"]).length == 0)
            {
                // hide the set table if it's empty
                $(`#ex-${this.id} table.set-data`).addClass("hidden");
            }
            else
            {
                // create rows of set table
                $.each(this.data["sets"], (set_id,v) => {
                    let set_row = create_editting_set_row(this, set_id, v["weight"], v["reps"]);
                    $(`#ex-${this.id} table.set-data tbody`).append($(set_row));
                });
                    
                // label the rows of the set table
                $(`#ex-${this.id} table.set-data tbody tr`).each((i,row) => {
                    $(row).find(`td.idx`).text(i + 1);
                });
            }

            // add event for new set button
            $(`#ex-${this.id} button.new-set`).click(() => {
                let init_weight = 0;
                let init_reps = 0;
                
                // calculate the id for the new set. This will be the largest existing id + 1. If this is first set then idx is 1.
                let set_id = Object.keys(this.data["sets"]).length == 0 ? 1 : Math.max(...$.map(Object.keys(this.data["sets"]), Number)) + 1;
                
                //console.log(`New set idx: ${set_id}`);
                
                this.data["sets"][set_id] = {"weight":init_weight, "reps":init_reps};
                let set_row = create_editting_set_row(this, set_id, init_weight, init_reps);
                
                // add the row to the table
                $(`#ex-${this.id} table.set-data`).append($(set_row));

                if ($(`#ex-${this.id} table.set-data`).hasClass("hidden"))
                {
                    // if the table was empty and therefore hidden then remove this
                    $(`#ex-${this.id} table.set-data`).removeClass("hidden");
                }
                // label the rows of the set table
                $(`#ex-${this.id} table.set-data tbody tr`).each((i,row) => {
                    $(row).find(`td.idx`).text(i + 1);
                });
            });

            // add event for save changes button
            $(`#ex-${this.id} button.save-ex`).click(() => {

                let new_name = $(`#ex-${this.id} input.name`).val();
                let new_config = $(`#ex-${this.id} select.equip-dropdown`).val();
                let new_details =  $(`#ex-${this.id} input.details`).val();

                if (new_name == "")
                {
                    $(`#ex-${this.id} .error-feedback`).text("Must provide a name for the exercise");
                }
                else
                {
                    $(`#ex-${this.id} .error-feedback`).text("");
                    this.name = new_name;
                    this.data["config"] = new_config;
                    this.data["details"] = new_details;
                    
                    $.each(this.data["sets"], (set_id,v) => {
                        this.data["sets"][set_id]["weight"] = $(`#ex-${this.id} table.set-data tr.set-${set_id} input.weight`).val();
                        this.data["sets"][set_id]["reps"] = $(`#ex-${this.id} table.set-data tr.set-${set_id} input.reps`).val();  
                    });

                    // sync the exercise card data with the server data
                    this.board.save_exercise(this);

                    this.editting = false;
                    this.render();
                }
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
                <div class="ex-header-view">
                    <div class="ex-name">${this.name}</div>
                    <div class="edit-button-container"><button class="edit-ex large">Edit</button></div>
                </div>
                <div class="ex-details-view">
                    <div class="detail-elem">${this.data["config"]}</div>
                    <div class="detail-elem">${this.data["details"]}</div>
                </div>
                
                <div class="set-table-container">
                    <table class="set-data">
                        <thead>
                            <th>#</th>
                            <th>Weight</th>
                            <th>Reps</th>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            `);

            $(`#ex-${this.id}`).empty();
            $(`#ex-${this.id}`).append(card);

            if (Object.keys(this.data["sets"]).length == 0)
            {
                $(`#ex-${this.id} table.set-data`).addClass("hidden");
            }
            else
            {
                // create rows of set data table
                $.each(this.data["sets"], (set_id,v) => {
                    let set_row = $(`
                        <tr class="set-${set_id}">
                            <td class="idx"></td>
                            <td class="weight">${v["weight"]}</td>
                            <td class="reps">${v["reps"]}</td>
                        </tr>`);
                    $(`#ex-${this.id} table.set-data tbody`).append($(set_row));
                });

                // label the rows of the set table
                $(`#ex-${this.id} table.set-data tbody tr`).each((i,row) => {
                    $(row).find(`td.idx`).text(i + 1);
                });
            }

            // add event for edit button
            $(`#ex-${this.id} button.edit-ex`).click(() => {
                this.editting = true;
                this.render();
            });
        }
    }
}


$(document).ready(function(){

    let current_date = new Date();

    $("#ex-date-selector .current-date .day").text(days[current_date.getDay()]);
    $("#ex-date-selector .current-date .date").text(formatDate(current_date, "UK"));
    
    let exercise_board = new ExerciseBoard(current_date);

    $("#print-data").click(() => { 
        console.log(exercise_board.exercise_cards);
    });
    
    $("#new-weight-ex").click(() => {
        exercise_board.new_exercise("weight");
    });

    $("#ex-date-selector .left-arrow").click(() => {
        current_date.setDate(current_date.getDate() - 1);
        $("#ex-date-selector .current-date .day").text(days[current_date.getDay()]);
        $("#ex-date-selector .current-date .date").text(formatDate(current_date, "UK"));
        exercise_board = new ExerciseBoard(current_date);
    });
    
    $("#ex-date-selector .right-arrow").click(() => {
        current_date.setDate(current_date.getDate() + 1);
        $("#ex-date-selector .current-date .day").text(days[current_date.getDay()]);
        $("#ex-date-selector .current-date .date").text(formatDate(current_date, "UK"));
        exercise_board = new ExerciseBoard(current_date);
    });
    
});