using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chat.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class checkPair : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Cancel",
                table: "Friends",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Confirm",
                table: "Friends",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cancel",
                table: "Friends");

            migrationBuilder.DropColumn(
                name: "Confirm",
                table: "Friends");
        }
    }
}
