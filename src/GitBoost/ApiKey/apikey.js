
function _generate()
{
    return Math.random().toString(36).slice(-16);
}


module.exports.generate = _generate;
