import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Table from './Table';
import TableHeader from './TableHeader';

function initState(props) {
    return {
        rows: (props.rows || props.data).slice(),
        sortHeader: null,
        isAsc: true
    };
}

class SortableTable extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        columns: (props, propName, componentName) => {
            if(props[propName]) {
                return new Error(`${componentName}: \`${propName}\` is deprecated, please use the component \`TableHeader\` instead.`);
            }
        },
        data: (props, propName, componentName) => {
            if(props[propName]) {
                return new Error(`${componentName}: \`${propName}\` is deprecated, please use \`rows\` instead. \`${propName}\` will be removed in the next major release.`);
            }
        },
        onSelectionChanged: PropTypes.func,
        rows: PropTypes.arrayOf(
            PropTypes.object
        ).isRequired,
        selectable: PropTypes.bool,
        shadow: PropTypes.number
    };

    constructor(props) {
        super(props);

        this.handleClickColumn = this.handleClickColumn.bind(this);

        this.state = initState(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(initState(nextProps));
    }

    getColumnClass(column) {
        const { sortHeader, isAsc } = this.state;

        return classNames(column.className, {
            'mdl-data-table__header--sorted-ascending': sortHeader === column.name && isAsc,
            'mdl-data-table__header--sorted-descending': sortHeader === column.name && !isAsc
        });
    }

    getDefaultSortFn(a, b, isAsc) {
        return isAsc
            ? a.localeCompare(b)
            : b.localeCompare(a);
    }

    handleClickColumn(e, columnName) {
        const isAsc = this.state.sortHeader === columnName ? !this.state.isAsc : true;

        const columns = !!this.props.children
            ? React.Children.map(this.props.children, child => child.props)
            : this.props.columns;

        let sortFn = this.getDefaultSortFn;
        for(let i = 0; i < columns.length; i++) {
            if(columns[i].name === columnName && columns[i].sortFn) {
                sortFn = columns[i].sortFn;
                break;
            }
        }

        this.setState({
            sortHeader: columnName,
            isAsc,
            rows: this.state.rows.sort((a, b) =>
                sortFn(
                    String(a[columnName]),
                    String(b[columnName]),
                    isAsc
                )
            )
        });
    }

    render() {
        const { children, columns, rows, ...otherProps } = this.props;

        const columnChildren = !!children
            ? React.Children.map(children, child =>
                React.cloneElement(child, {
                    className: this.getColumnClass(child.props),
                    onClick: this.handleClickColumn
                })
            )
            : columns.map((column) =>
                <TableHeader
                    key={column.name}
                    className={this.getColumnClass(column)}
                    name={column.name}
                    numeric={column.numeric}
                    tooltip={column.tooltip}
                    onClick={this.handleClickColumn}
                >
                    {column.label}
                </TableHeader>
            );

        return (
            <Table rows={this.state.rows} {...otherProps}>
                {columnChildren}
            </Table>
        );
    }
}

export default SortableTable;
