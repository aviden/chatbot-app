import { BotCompanion } from "../BotCompanion";
import fs from "fs";
import csv from "csv-parser";

type FileEntry = {
    team: string,
    city: string,
    league: string,
    year: string,
    sport: string
}

export class DataQuestionHandlers {

    fileData: FileEntry[] = [];
    itemCategories: {                           // This maps league and sport names to categories ('league' or 'sport'). 
        [index: string]: "league" | "sport"     // For ex.: 'NHL' => 'league', 'foolball' => 'sport', 'NFL' => 'league' etc.
    } = {};

    constructor() {
        this.loadData();
        this.register();
    }

    private async loadData() {
        const fileStream = fs.createReadStream('./assets/sports-teams.dat')
            .pipe(csv({
                headers: ['team', 'city', 'league', 'year', 'sport'],
                skipLines: 1,
                mapValues: ({ value }) => value.trim()
            }))
            .on('data', (data: FileEntry)  => {
                this.fileData.push(data);
                if (!Object.hasOwn(this.itemCategories, data.league)) {
                    this.itemCategories[data.league] = 'league';
                }
                if (!Object.hasOwn(this.itemCategories, data.sport)) {
                    this.itemCategories[data.sport] = 'sport';
                }
            });
        // wait until the stream finished processing (or closes with an error)
        await new Promise(resolve => fileStream.on("finish", resolve).on("close", resolve));
        //console.log(this.itemCategories);
    }
    
    public register() {
        BotCompanion.registerQuestionHandler(/sports-teams.dat.*are you ready to go\?/si, this.begin);
        BotCompanion.registerQuestionHandler(/Which of the following is (?:a|an) (\w*) team: (.*)\?/i, this.getTeamsByLeagueOrSport, this);
        BotCompanion.registerQuestionHandler(/What sports teams in the data set were established in (\d*)\?/i, this.getTeamsByYear, this);
    }

    public begin(): string {
        return 'yes';
    }

    public getTeamsByLeagueOrSport([key, teamNames]: string[]): string {
        const teams = teamNames.split(',').map(s => s.trim().toLowerCase());
        const category = this.itemCategories[key];
        const filteredFileItems = this.fileData.filter((entry: FileEntry) => entry[category] === key);
        const filteredTeams: string[] = [];
        filteredFileItems.forEach((entry: FileEntry) => {
            if (teams.includes(entry.team.toLowerCase())) {
                filteredTeams.push(entry.team);
            }
        });
        return filteredTeams.join(', ');
    }

    public getTeamsByYear([year]: string[]): string {
        return this.fileData
            .filter((entry: FileEntry) => entry.year === year)
            .map((entry: FileEntry) => entry.team)
            .join(', ');
    }
}