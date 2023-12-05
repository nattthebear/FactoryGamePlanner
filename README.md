# Factory Game Planner

https://nattthebear.github.io/FactoryGamePlanner/

A simple tool for [Satisfactory](https://www.satisfactorygame.com/) that assist in planning factories and production lines.

## How to Use

### Planner

The planner uses linear algebra to calculate the optimal choice of recipes for a production line.

-   Select the resources and intermediate products available for this factory in **Resource Limits**.
-   Select which recipies you have and want to use in **Basic Recipes** and **Alternate Recipes**.
-   An optimized solution will be calculated and appear in **Solution**.
-   Once you're satisfied with your solution, use **Copy Solution to Editor** to transfer this solution to the editor.

### Editor

**NOTE: As currently implemented, the editor is much less useful than the planner and shouldn't be used for larger factories.**

The editor allows you to organize your production line like a flowchart.
Most functionality is implemented through hotkey-activated buttons that appear at the bottom right.

-   The mousewheel, or PageUp / PageDown, zooms in and out.
-   When hovering over empty space, you can click and drag to pan the viewport.
-   When hovering over empty space, the actions will show new things you can add to the factory.
    -   **Add Builder** adds a new production building or power building.
        As rates can exceed 2.5x, one of these can count for many individual physical structures.
    -   **Add Source** adds a resource input. Use these to simluate input from mines, trains, or other external logistics.
    -   **Add Sink** adds a resource output. Use these to simulate AWESOME Sinks, or output to other logistics systems.
    -   **Add Bus** adds a multi-resource sushi belt. This can ease the calculation of certain kinds of combined logistics lines.
-   When hovering over a building, you can click and drag to move this building.
-   When hovering over a building, the actions will show ways to modify this building.
    -   **Remove Building** removes this building entirely.
    -   **Change Rate** allows you to manually input a new rate for the building,
        either in resources per minute for sources and sinks,
        or the overclock / building count rate for production buildings.
    -   **Merge** allows merging with another building of the same type, fusing their connections and adding their rates.
        -   Once merging starts, press `m` while moused over another building of the same type to finish the merge, or `Esc` to cancel.
-   When hovering over an input or output on a building, the actions will show ways to modify this specific terminal.
    -   **Match Rate of Connections** tries to automatically adjust the rate of the building to satisfy either its inputs or outputs.
    -   **Balance Rates with new Building** allows placing a new building to handle the excess or shortfall at this connection.
    -   **Add Connector** starts drawing a connector from this terminal to another one. Connectors represent pipes or conveyor belts.
        -   Once connecting starts, press `c` while over another terminal for the same resource to finish the connection, or `Esc` to cancel.
-   When hovering over a connection, the actions will show ways to modify the connection or the buildings connected to it.
    -   **Remove Connection** removes this connector entirely.
    -   **Match Rate of Closest Connection** modifies the rate of the building on one end of the connection to match the other.
        Which end is modified depends on which half of the connection the mouse is over.
    -   **Split Connector off Closest Building** can be used whenever two connectors both enter the same building.
        The building will be split into two duplicates, with the rates split as appropriate for the connectors.
    -   **Connect to Bus** will cause this connector to route through a bus. Buses represent multi-product sushi belts.
        -   Once connecting starts, press `n` while moused over a bus to finish the connection, or `Esc` to cancel.
    -   **Disconnect from Bus** does the opposite of Connect to Bus.
-   When hovering over a bus, you can click and drag to move it.
    When hovering over one of the ends, you can click and drag to resize it.
    When hovering over one of the connections, you can click and drag to slide the connection along the bus.
-   When hovering over a bus, the actions will show ways to modify the bus.
    -   **Remove Bus** will remove this bus entirely; all connectors will go back to their original state.
    -   **Connect to Connector** will start a connection to a connector.
        -   Once connecting starts, press `n` while moused over a connector to finish the connection, or `Esc` to cancel.

### Saving, Loading, and Sharing Content

The URL bar will always update to the current state of the planner and editor.
By copying everything, including all characters past the `#`, you can save plans and share them with others.

### Examples

-   A simple modular frame factory:
    https://nattthebear.github.io/FactoryGamePlanner/#e.A___________________PAAAAAAAAAAAAAADoiB2shsXGZgByPPjBKIfhHGIg0FfYAACmtgBEIRyCGgg4VHYADS3ugBOIdsCGQhg3LYAESH0ALYgEMAd.AHkwECQAhCLwKRBcgJ0DMwdg6BdwAUA0dq-MRBYQ-dXGNRBcARbT58wAgQ4YV_ExAMBkiG7swAOgbrpfCfwAtBVyhdqYgB
-   Battery production
    https://nattthebear.github.io/FactoryGamePlanner/#e.A___________________PAAAAAAAAAAAAAADIvBcshsXGZgByPPjBKIfhHGIg0FfYAACmtgBEIRyCGgg4VHYADS3ugBOIdsCGQhg3LYAESH0ALYgEMAd.AJswIDAQhXASUVUYQoRhARRxU0QpQyAKBWB1CsB8CYiI1MwAIDIcK88QCMDAZ05cQEUDQfI1cQBcDIcI1UwBMGglV9cwAUmchtFdwAqAgMQfKdwAmAgMmhqswACA8K6c2aAJAQGSNfMQOAFtqn8GQDA9hfUrCGY
-   Plastic and Rubber production using recycling:
    https://nattthebear.github.io/FactoryGamePlanner/#e.A___________________PABAIAAAAAAAIAAFIbCDYT2EGo2GyeZkBGI_8MGog8FeYgASX8hBAIY2CGQgEJLYACiXdgBMId7CG4g0xKYAFCevgBQIdQDsgBSwA0B.AJkwGGAQBUB0BwEYASUxQjACRSRFBVC4w9Yb7UxA8xiaPAlyBEisa9HlyBkiecf4kyBAVai9BV2E0ZiiO60YgJ8gdWL6kNhBqmHlFClNhBMRpWu_EqhBymmlI7kNhBG
-   Assembly Directory Systems:
    https://nattthebear.github.io/FactoryGamePlanner/#e.A__________________________________D4gCelhsXGZgByPPjBKIfhHGIg0FfYAACmtgBEIRyCGgg0tLYgDSHrgBUI49CGAh0BNwCGIBDQH.AN8QhB8AAvCCwgAWInAw5CCaIHh4TgMfovLSghEmIhMUKDl2AmBwagG0ADCAjgwWQsMQjAzI4sEgQBQKAENEpDKMAqDg7g4WAOMiLjOSoGEopCasglEcLh3kgtKaDDSUIFQoiBCbgwIQ0BGfgHOgECgoAIOKyDukorNqcCm04pOqTjMjITIykiAgrFZoaoCgh0gixY2IBqgIQe63jXNWI4uCYCqCrEKhBAILZR04gBoIsDn7ZiC4ICPt9ZiBApgGL74gF4Kf8mC62CRBZ5licRCLwZr6aaRBDAa7HmjRDLQCMzt9TILgJ2SRF1sRC1ABlIT7GvasQ4ODAT2JBI2jbCtAN9n0iX3yp0B4ksS2YVxAAVxTTa8JnIVQUSc55TELgUhS9uVBHAVIjdLUCLQVCutw0ADAce8AGxorvE8UG0YRdGY0-gjwRCMvCJiFoyyVh4JkPozGngeY2koCn4C8sDNWtutQVIKBlw9sQB0KsbIil2AmwrE5K-8vxAxfoX3CrZxBF4AXeap66lCCxDsm8IxrGLEtAF03TrYPupDDQ5zwX3ypDLgVzsPhGYAT8yiGXjelQVXQPpZTqYzFz7iSoCqmilbFcogKFvo5Ko2fw-PI1viZjgZ5A3GIz7MOvRr8VcZAN_mo1AuKWjqeQ5yY_RxCrX3C2kYAeNWY3BvetR9Kgc8hHj05qARx53ArSYT3HuljkcJkpDPNzIVG-yNx5Tm0uj5DcpwE

### Reporting Bugs

Please use the issue tracker to report any bugs. Include detailed reproduction instructions and a full planner URL when possible.
