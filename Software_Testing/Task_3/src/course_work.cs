using System.Data;
using System.Reflection.Metadata;
using static System.Net.Mime.MediaTypeNames;

public class TestClass {
    // Load data file
    static List<NCAAGame> LoadDataContent(string fileSRC) {
        List<NCAAGame> result = new List<NCAAGame>();
        if (string.IsNullOrEmpty(fileSRC)) fileSRC = "../static/NCAAdata.txt";
        string[] lines = File.ReadAllLines(fileSRC);

        if (lines.Length > 0) dataHeader = lines[0]; // First get the header line

        foreach (string line in lines) {
            string[] parts = line.Split("\t");
            // Check if it meets the standard, a line needs to have four data items
            if (parts != null && parts.Length > 0 && parts.Length - 1 == 4) {
                int score_C = -1;
                int score_R = -1;
                string champion = string.Empty;
                string runner_up = string.Empty;

                // Store the NCAAGame names and scores for champion and runner-up respectively
                if (int.Parse(parts[2]) < int.Parse(parts[4])) {
                    score_C = int.Parse(parts[4]);
                    score_R = int.Parse(parts[2]);
                    champion = parts[3];
                    runner_up = parts[1];
                } else {
                    score_C = int.Parse(parts[2]);
                    score_R = int.Parse(parts[4]);
                    champion = parts[1];
                    runner_up = parts[3];
                }
                result.Add(new NCAAGame { score_C = score_C, score_R = score_R, champion = champion, runner_up = runner_up, year = int.Parse(parts[0]) });
            }
        }
        NCAAGameSort(result);
        //foreach (var item in result) {
        //    Console.WriteLine("{0}\t{1}\t{2}\t{3}:{4}", item.year, item.champion, item.runner_up, item.score_C, item.score_R);
        //}
        //Console.WriteLine("========================================");
        return result;
    }

    // Sort NCAAGames (using insertion sort)
    static void NCAAGameSort(List<NCAAGame> gameList) {
        for(int i = 1;i < gameList.Count;i++) {
            NCAAGame item = gameList[i];
            int j = i - 1;
            while (j >= 0 && gameList[j].year > item.year) {
                gameList[j + 1] = gameList[j];
                j--;
            };
            gameList[j + 1] = item;
        }
    }

    // Add global variables related to logging
    static StreamWriter logWriter = null;
    static int commandCount = 0;
    static string dataHeader = "";

    static void LoadCommandContent(string fileSRC) {
        List<NCAAGame> result = new List<NCAAGame>();
        List<NCAAGame> gameList = LoadDataContent("../static/" + dataFileSrc);
        string[] lines = File.ReadAllLines(fileSRC);

        string logSRC = "../static/" + logFileSrc;
        logWriter = new StreamWriter(logSRC);
        // Write log file header
        logWriter.WriteLine("Programmer: Zaki Malik");
        logWriter.WriteLine("CS 1044 Spring 2009 Project 6");
        logWriter.WriteLine(dataHeader.Split(": ")[0]);

        foreach (string line in lines) {
            string[] parts = line.Split("\t");
            commandCount++;

            // Write separator line and command
            WriteOutput("------------------------------------------------------------");
            string commandNumber = FormatCommandNumber(commandCount); // Format command number to 3 digits
            WriteOutput(commandNumber + "   " + line);

            switch (parts[0]) {
                case "year":
                    int type = int.Parse(parts[2]);
                    int year = int.Parse(parts[1]);
                    bool hasData = false;

                    foreach (NCAAGame item in gameList) {
                        // Display runner-up or champion label based on type
                        if (year == item.year) {
                            if (type == 2) WriteOutput("Runner-up:   " + item.runner_up);
                            else if (type == 1) WriteOutput("Champion:    " + item.champion);

                            hasData = true;
                            break;
                        }
                    }

                    if (!hasData) WriteOutput(year + "  not found");
                    break;
                case "titles":
                    int countChampion = 0;
                    int countRunnerup = 0;
                    string name = parts[1]; // NCAAGame name

                    foreach (NCAAGame item in gameList) {
                        bool hasChampion = name == item.champion;
                        bool hasRunnerup = name == item.runner_up;

                        // Count the times this NCAAGame won championship or runner-up
                        if (hasRunnerup) {
                            countRunnerup++;
                        } else if (hasChampion) {
                            countChampion++;
                        }
                    }

                    WriteOutput("Titles:      " + countChampion + "      Runner-up:      " + countRunnerup);
                    break;
                case "margin":
                    int startYear = int.Parse(parts[1]); // Starting year
                    int numYears = int.Parse(parts[2]); // Number of years to calculate
                    int startIndex = -1; // Starting year index

                    for (int i = 0; i < gameList.Count; i++) {
                        if (gameList[i].year == startYear) {
                            startIndex = i;
                            break;
                        }
                    }
                    if (startIndex == -1) {
                        WriteOutput(startYear + " not found");
                    } else {
                        double totalMargin = 0;
                        int count = 0;

                        for (int i = 0; i < numYears; i++) {
                            int currentIndex = startIndex + i;
                            if (currentIndex < gameList.Count) {
                                NCAAGame item = gameList[currentIndex]; // Find the data for the current year to process
                                int margin = Math.Abs(item.score_C - item.score_R); // Calculate the score difference for each game
                                totalMargin += margin;
                                count++;
                            }
                        }
                         
                        double average = totalMargin / count; // Sum all differences and calculate average
                        int endYear = startYear + count - 1;
                        WriteOutput("Average Margin        " + startYear + "-" + endYear + ":    " + average.ToString("F1"));
                    }
                    break;
            }
        }

        WriteOutput("------------------------------------------------------------");
        if (logWriter != null) logWriter.Close();
        Console.WriteLine("\nLog file generated:" + logSRC);
    }

    // Add a helper function to write to both console and log file
    static void WriteOutput(string text) {
        Console.WriteLine(text);
        if (logWriter != null) {
            logWriter.WriteLine(text);
        }
    }

    // Add function to format command number
    static string FormatCommandNumber(int number) {
        if (number < 10) return "00" + number;
        else if (number < 100) return "0" + number;
        else return number.ToString();
    }

    // Add file path variables
    static string dataFileSrc = "";
    static string infoFileSrc = "";
    static string logFileSrc = "";
    static void SelectFiles() {
        Console.WriteLine("========================================");
        Console.WriteLine("Please select file group to process：");
        Console.WriteLine("A：Use NCAAdata.txt, NCAAinfo.txt, NCAAlog.txt");
        Console.WriteLine("B：Use NCAAdata1.txt, NCAAinfo1.txt, NCAAlog1.txt");
        Console.WriteLine("C：Use NCAAdata2.txt, NCAAinfo2.txt, NCAAlog2.txt");
        Console.WriteLine("========================================");
        Console.Write("Please enter your choice (A/B/C): ");

        string choice = Console.ReadLine().ToUpper();
        // Set file paths based on selection
        switch (choice) {
            case "A":
                dataFileSrc = "NCAAdata.txt";
                infoFileSrc = "NCAAinfo.txt";
                logFileSrc = "NCAAlog.txt";
                break;
            case "B":
                dataFileSrc = "NCAAdata1.txt";
                infoFileSrc = "NCAAinfo1.txt";
                logFileSrc = "NCAAlog1.txt";
                break;
            case "C":
                dataFileSrc = "NCAAdata2.txt";
                infoFileSrc = "NCAAinfo2.txt";
                logFileSrc = "NCAAlog2.txt";
                break;
            default:
                Console.WriteLine("Invalid choice, using default group A files!");
                dataFileSrc = "NCAAdata.txt";
                infoFileSrc = "NCAAinfo.txt";
                logFileSrc = "NCAAlog.txt";
                break;
        }

        //Console.WriteLine("\nSelected：");
        //Console.WriteLine("Data file: " + dataFileSrc);
        //Console.WriteLine("Command file: " + infoFileSrc);
        //Console.WriteLine("Log file: " + logFileSrc);
        Console.WriteLine("\n");
    }

    // Boot method
    public static void Boot() {
        //LoadDataContent("../static/NCAAdata.txt");
        SelectFiles();
        LoadCommandContent("../static/" + infoFileSrc);
    }

    struct NCAAGame {
        public int score_C;
        public int score_R;
        public string champion;
        public string runner_up;
        public int year;
    }
}