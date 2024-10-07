#!/usr/bin/env node

const pg = require('pg');

if (!process.env.FRONIUS_HOST) {
    console.error('environment variable FRONIUS_HOST is not defined');
    process.exit(-1);
}
if (!process.env.PGHOST) {
    console.error('environment variable PGHOST is not defined');
    process.exit(-1);
}
if (!process.env.PGUSER) {
    console.error('environment variable PGUSER is not defined');
    process.exit(-1);
}
if (!process.env.PGPASSWORD) {
    console.error('environment variable PGPASSWORD is not defined');
    process.exit(-1);
}
if (!process.env.PGDATABASE) {
    console.error('environment variable PGDATABASE is not defined');
    process.exit(-1);
}
if (!process.env.PGTABLE) {
    console.error('environment variable PGTABLE is not defined');
    process.exit(-1);
}


(async () => {
    const res1 = await fetch('http://' + process.env.FRONIUS_HOST + '/solar_api/v1/GetPowerFlowRealtimeData.fcgi');
    const powerFlowRealtimeData = JSON.parse(await res1.text()).Body.Data;
    const res2 = await fetch('http://' + process.env.FRONIUS_HOST + '/solar_api/v1/GetMeterRealtimeData.cgi');
    const meterRealtimeData = JSON.parse(await res2.text()).Body.Data['0'];

    //console.log('Data fetched. Connecting to database');
    const pgClient = new pg.Client();
    await pgClient.connect();

    const query = 'INSERT INTO ' + process.env.PGTABLE + ' VALUES (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41);'
    const values = [
        powerFlowRealtimeData.Site.P_Akku,
        powerFlowRealtimeData.Site.P_Grid,
        powerFlowRealtimeData.Site.P_Load,
        powerFlowRealtimeData.Site.P_PV,
        powerFlowRealtimeData.Inverters['1'].SOC,
        meterRealtimeData.Current_AC_Phase_1,
        meterRealtimeData.Current_AC_Phase_2,
        meterRealtimeData.Current_AC_Phase_3,
        meterRealtimeData.Current_AC_Sum,
        meterRealtimeData.EnergyReactive_VArAC_Sum_Consumed,
        meterRealtimeData.EnergyReactive_VArAC_Sum_Produced,
        meterRealtimeData.EnergyReal_WAC_Minus_Absolute,
        meterRealtimeData.EnergyReal_WAC_Plus_Absolute,
        meterRealtimeData.EnergyReal_WAC_Sum_Consumed,
        meterRealtimeData.EnergyReal_WAC_Sum_Produced,
        meterRealtimeData.Frequency_Phase_Average,
        meterRealtimeData.Meter_Location_Current,
        meterRealtimeData.PowerApparent_S_Phase_1,
        meterRealtimeData.PowerApparent_S_Phase_2,
        meterRealtimeData.PowerApparent_S_Phase_3,
        meterRealtimeData.PowerApparent_S_Sum,
        meterRealtimeData.PowerFactor_Phase_1,
        meterRealtimeData.PowerFactor_Phase_2,
        meterRealtimeData.PowerFactor_Phase_3,
        meterRealtimeData.PowerFactor_Sum,
        meterRealtimeData.PowerReactive_Q_Phase_1,
        meterRealtimeData.PowerReactive_Q_Phase_2,
        meterRealtimeData.PowerReactive_Q_Phase_3,
        meterRealtimeData.PowerReactive_Q_Sum,
        meterRealtimeData.PowerReal_P_Phase_1,
        meterRealtimeData.PowerReal_P_Phase_2,
        meterRealtimeData.PowerReal_P_Phase_3,
        meterRealtimeData.PowerReal_P_Sum,
        meterRealtimeData.TimeStamp,
        meterRealtimeData.Visible,
        meterRealtimeData.Voltage_AC_PhaseToPhase_12,
        meterRealtimeData.Voltage_AC_PhaseToPhase_23,
        meterRealtimeData.Voltage_AC_PhaseToPhase_31,
        meterRealtimeData.Voltage_AC_Phase_1,
        meterRealtimeData.Voltage_AC_Phase_2,
        meterRealtimeData.Voltage_AC_Phase_3
    ];
    //console.log(query);
    //console.log(values);
    const result = await pgClient.query(query, values);
    //console.log(result);

    await pgClient.end();
})();
