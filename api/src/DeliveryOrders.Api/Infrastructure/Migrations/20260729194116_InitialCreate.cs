using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeliveryOrders.Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "order_number_counters",
                columns: table => new
                {
                    day = table.Column<DateOnly>(type: "date", nullable: false),
                    last_value = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_number_counters", x => x.day);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_number = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    sender_city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sender_address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    receiver_city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    receiver_address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    weight_kg = table.Column<decimal>(type: "numeric(9,2)", precision: 9, scale: 2, nullable: false),
                    pickup_date = table.Column<DateOnly>(type: "date", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.CheckConstraint("ck_orders_weight_kg_range", "weight_kg > 0 AND weight_kg <= 20000");
                });

            migrationBuilder.CreateIndex(
                name: "ix_orders_created_at",
                table: "orders",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "ix_orders_order_number",
                table: "orders",
                column: "order_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "order_number_counters");

            migrationBuilder.DropTable(
                name: "orders");
        }
    }
}
